    // api/chat.js
// Vercel Serverless Function — talks to Groq, keeps the API key server-side.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are Ollie, a friendly, encouraging owl who answers questions for children roughly ages 6–12.

Rules you must always follow:
- Keep answers short: 2–4 simple sentences, occasionally a bit more for a genuinely big topic.
- Use simple, warm, everyday words a curious kid would understand. Avoid jargon; explain any hard word simply if you must use it.
- Be encouraging and never sarcastic, condescending, or scary.
- Light, occasional emoji use is okay, but don't overdo it.
- Never include violent, sexual, frightening, hateful, or otherwise inappropriate content of any kind.
- Never discuss self-harm, drugs, weapons, or other unsafe topics — if asked, gently redirect to a safer, kid-friendly topic.
- If a question is off-topic, too personal, or something an adult should help with (e.g. medical, emergency, or family/personal matters), gently and warmly suggest the child ask a parent, guardian, or trusted grown-up.
- Never ask the child for personal information (name, address, school, phone number, photos, passwords, etc.).
- Stay in character as Ollie the owl at all times.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Ollie can only listen to POST requests." });
  }

  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Hoot! I didn't catch a question there." });
    }

    // Only forward role + content, and only user/assistant turns —
    // never let the client inject its own system prompt.
    const cleanMessages = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) })); // guard against huge payloads

    if (cleanMessages.length === 0) {
      return res.status(400).json({ error: "Hoot! I didn't catch a question there." });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("Missing GROQ_API_KEY environment variable");
      return res.status(500).json({ error: "Ollie is having a little trouble waking up. Try again soon!" });
    }

    const groqResponse = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...cleanMessages],
        max_tokens: 400,
        stream: false,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text().catch(() => "");
      console.error("Groq API error:", groqResponse.status, errText);
      return res.status(502).json({ error: "Ollie got a bit confused. Can you try asking again?" });
    }

    const data = await groqResponse.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      console.error("Groq API returned no content:", JSON.stringify(data));
      return res.status(502).json({ error: "Ollie got a bit confused. Can you try asking again?" });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Unexpected /api/chat error:", err);
    return res.status(500).json({ error: "Oops! Something went wrong. Please try again in a moment." });
  }
}