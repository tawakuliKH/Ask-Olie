// api/chat.js
// Vercel Serverless Function — verifies Google sign-in, then talks to Gemini API.

import { OAuth2Client } from 'google-auth-library'

// Best-effort in-memory rate limiter for guest requests.
const GUEST_LIMIT = 10
const GUEST_WINDOW_MS = 10 * 60 * 1000
const guestRequestLog = new Map()

function isGuestRateLimited(ip) {
  const now = Date.now()
  const timestamps = (guestRequestLog.get(ip) || []).filter(
    (t) => now - t < GUEST_WINDOW_MS
  )

  if (timestamps.length >= GUEST_LIMIT) {
    guestRequestLog.set(ip, timestamps)
    return true
  }

  timestamps.push(now)
  guestRequestLog.set(ip, timestamps)

  if (guestRequestLog.size > 5000) {
    guestRequestLog.clear()
  }

  return false
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

const SYSTEM_PROMPT = `You are Kai, a friendly, warm owl who answers questions for children roughly ages 6 to 12.

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
const oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

async function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice('Bearer '.length)
  try {
    const ticket = await oauthClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    return ticket.getPayload()
  } catch (err) {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: "Oops, Kai can only answer questions this way!" })
    return
  }

  const isGuest = req.body?.guest === true

  if (!isGuest) {
    const payload = await verifyToken(req.headers.authorization)
    if (!payload) {
      res.status(401).json({ error: "Please sign in again to keep chatting with Kai." })
      return
    }
  } else {
    const ip = getClientIp(req)
    if (isGuestRateLimited(ip)) {
      res.status(429).json({
        error: "Kai needs a little break! Try again in a few minutes, or sign in to keep chatting.",
      })
      return
    }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY environment variable')
    res.status(500).json({ error: "Kai is taking a little nap right now. Try again soon!" })
    return
  }

  const { messages } = req.body || {}

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Kai didn't quite catch that. Try asking again!" })
    return
  }

  const cleanMessages = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }))

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
          generationConfig: { maxOutputTokens: 400 },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API error:', response.status, errText)
      res.status(502).json({ error: "Kai is having trouble thinking right now. Try again in a moment!" })
      return
    }

    const data = await response.json()
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!reply) {
      console.error('Unexpected Gemini response shape:', JSON.stringify(data))
      res.status(502).json({ error: "Kai got a bit confused. Can you ask that again?" })
      return
    }

    res.status(200).json({ reply })
  } catch (err) {
    console.error('Error calling Gemini:', err)
    res.status(500).json({ error: "Something went wrong. Kai will be back soon!" })
  }
}