import type { VercelRequest, VercelResponse } from '@vercel/node'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.0-flash-exp'

async function searchWeb(query: string): Promise<string> {
  const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
  
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(ddgUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return `Search failed: ${response.status}`
    }

    const html = await response.text()
    
    const results: string[] = []
    const titleRegex = /<a class="result__a"[^>]*href="[^"]*"[^>]*>([^<]+)<\/a>/g
    const snippetRegex = /<a class="result__snippet"[^>]*>([^<]+)<\/a>/g
    
    let match
    const titles = [...html.matchAll(titleRegex)].map(m => m[1]).slice(0, 5)
    const snippets = [...html.matchAll(snippetRegex)].map(m => m[1]).slice(0, 5)
    
    for (let i = 0; i < Math.min(titles.length, 5); i++) {
      results.push(`${i + 1}. ${titles[i]}${snippets[i] ? ': ' + snippets[i] : ''}`)
    }

    return results.length > 0 ? results.join('\n') : 'No results found'
  } catch (err) {
    clearTimeout(timeout)
    return `Search error: ${err}`
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { query } = req.body

  if (!query) {
    return res.status(400).json({ error: 'Missing query' })
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
  }

  const searchResults = await searchWeb(query)

  const summaryPrompt = `You are a research assistant. Based on these search results, provide a concise summary and answer.

Search results:
${searchResults}

User query: ${query}

Provide a helpful, accurate response based on the search results.`

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
          contents: [
            {
              role: 'user',
              parts: [{ text: summaryPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1024,
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

    return res.status(200).json({ 
      query,
      searchResults: searchResults.split('\n'),
      summary: text,
    })
  } catch (err: unknown) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timed out after 30 seconds' })
    }
    return res.status(500).json({ error: 'Research failed', details: String(err) })
  }
}