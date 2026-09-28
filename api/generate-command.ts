type VercelRequest = { method?: string; body?: { prompt?: string; version?: string } };
type VercelResponse = { status: (code:number)=>VercelResponse; json: (body:unknown)=>void };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  const prompt = req.body?.prompt?.trim();
  const version = req.body?.version || "1.21.11";
  if (!prompt) return res.status(400).json({ error: "Please describe the command you want." });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "AI backend is not configured yet." });

  const system = [
    "You are VoxelTools AI Command Agent.",
    "Generate valid Minecraft Java Edition commands only.",
    "The target version is " + version + ". Respect commands and syntax available in that version.",
    "Return exactly one command and nothing else.",
    "The command must start with /.",
    "Do not use markdown fences, explanations, or multiple alternatives.",
    "If the request is ambiguous, make the safest reasonable assumption and still return one command."
  ].join(" ");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      input: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ],
      max_output_tokens: 1000
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    return res.status(502).json({ error: "AI provider error.", detail });
  }

  const data = await response.json() as { output_text?: string };
  const command = (data.output_text || "").trim().replace(/^\`+|\`+$/g, "").trim();

  if (!command.startsWith("/")) return res.status(502).json({ error: "AI returned an invalid command." });
  return res.status(200).json({ command });
}
