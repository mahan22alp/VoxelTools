import http from "node:http";

const port = Number(process.env.PORT || 10000);
const apiKey = process.env.GEMINI_API_KEY;

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  if (req.method === "GET" && req.url === "/") {
    return send(res, 200, { ok: true, service: "VoxelTools AI Command Agent" });
  }
  if (req.method !== "POST" || req.url !== "/api/generate-command") {
    return send(res, 404, { error: "Not found." });
  }

  try {
    const body = await readBody(req);
    const prompt = String(body.prompt || "").trim();
    const version = String(body.version || "1.21.11");

    if (!prompt) return send(res, 400, { error: "Please describe the command you want." });
    if (!apiKey) return send(res, 500, { error: "Gemini backend is not configured yet." });

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
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=" +
        encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 300 }
        })
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      return send(res, 502, { error: "Gemini provider error.", detail: detail.slice(0, 1200) });
    }

    const data = await response.json();
    const command = (data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("") || "")
      .trim()
      .replace(/^\x60+|\x60+$/g, "")
      .trim();

    if (!command.startsWith("/")) {
      return send(res, 502, { error: "Gemini returned an invalid command." });
    }

    return send(res, 200, { command });
  } catch (error) {
    return send(res, 500, {
      error: error instanceof Error ? error.message : "Server error."
    });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log("VoxelTools AI API listening on port " + port);
});