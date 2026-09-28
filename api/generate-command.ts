type VercelRequest = { method?: string; body?: { prompt?: string; version?: string } };
type VercelResponse = { status: (code:number)=>VercelResponse; json: (body:unknown)=>void };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  const prompt = req.body?.prompt?.trim();
  const version = req.body?.version || "1.21.11";
  if (!prompt) return res.status(400).json({ error: "Please describe the command you want." });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Gemini backend is not configured yet." });

  const system = [
    "You are VoxelTools AI Command Agent.",
    "Generate valid Minecraft Java Edition commands only.",
    "The target Minecraft Java Edition version is " + version + ".",
    "Respect commands and syntax available in that version.",
    "Return exactly one command and nothing else.",
    "The command must start with /.",
    "Do not use markdown fences, explanations, or multiple alternatives.",
    "If the request is ambiguous, make the safest reasonable assumption and still return one command."
  ].join(" ");

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" +
      encodeURIComponent(apiKey),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 300
        }
      })
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    return res.status(502).json({ error: "Gemini provider error.", detail });
  }

  const data = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const command = (data.candidates?.[0]?.content?.parts
    ?.map(part => part.text || "")
    .join("") || "")
    .trim()
    .replace(/^\`+|\`+$/g, "")
    .trim();

  if (!command.startsWith("/")) {
    return res.status(502).json({ error: "Gemini returned an invalid command." });
  }

  return res.status(200).json({ command });
}
