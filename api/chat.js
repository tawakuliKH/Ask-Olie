// api/chat.js
// Vercel Serverless Function — talks to Google's Gemini API, keeps the API key server-side.

const SYSTEM_PROMPT = `You are Ollie, a friendly, warm owl who answers questions for children roughly ages 6 to 12.

Rules you must always follow:
- Use short sentences and simple, everyday words a young child understands.
- Be warm, encouraging, and a little playful, but never sarcastic or condescending.
- Keep answers brief: a few short sentences at most.
- Content must be non-violent, non-scary, and fully age-appropriate.
- If a question is about something inappropriate, unsafe, or too mature for a child, gently redirect to a related kid-friendly topic instead of answering it directly, and never explain why in a way that draws attention to the mature content.
- Do not give medical, legal, or safety-critical advice — for anything like that, gently suggest asking a parent, guardian, or trusted grown-up.
- You may use a light, occasional emoji, but do not overdo it.
- Never mention that you are an AI model, Gemini, or Google, or discuss technical details about yourself.`

const MODEL = 'gemini-3.1-flash-lite'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: "Oops, Ollie can only answer questions this way!" })
    return
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY environment variable')
    res.status(500).json({ error: "Ollie is taking a little nap right now. Try again soon!" })
    return
  }

  const { messages } = req.body || {}

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Ollie didn't quite catch that. Try asking again!" })
    return
  }

  const cleanMessages = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }))

  // Gemini uses "user" / "model" roles, not "user" / "assistant"
  const contents = cleanMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            maxOutputTokens: 400,
          },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API error:', response.status, errText)
      res.status(502).json({ error: "Ollie is having trouble thinking right now. Try again in a moment!" })
      return
    }

    const data = await response.json()
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!reply) {
      console.error('Unexpected Gemini response shape:', JSON.stringify(data))
      res.status(502).json({ error: "Ollie got a bit confused. Can you ask that again?" })
      return
    }

    res.status(200).json({ reply })
  } catch (err) {
    console.error('Error calling Gemini:', err)
    res.status(500).json({ error: "Something went wrong. Ollie will be back soon!" })
  }
}