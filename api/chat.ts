import type { VercelRequest, VercelResponse } from '@vercel/node'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.0-flash-exp'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, history } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Missing message' })
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
  }

  const systemPrompt = `You are OpenServe AI assistant. Help users with:
- Answering questions about the ad platform
- Helping with website building
- Research and content generation
- General questions

Be helpful, concise, and friendly.`

  const messages = history || []
  messages.push({ role: 'user', parts: [{ text: message }] })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: messages,
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    clearTimeout(timeout)

    if (!response.ok) {
      const errText = await response.text()
      return res.status(502).json({ error: `AI error: ${response.status}`, details: errText })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return res.status(502).json({ error: 'Empty response from AI' })
    }

    return res.status(200).json({ response: text })
  } catch (err: unknown) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timed out after 30 seconds' })
    }
    return res.status(500).json({ error: 'Chat failed', details: String(err) })
  }
}