import type { VercelRequest, VercelResponse } from '@vercel/node'

const API_KEYS = new Map<string, { plan: string; queries: number; reset: string }>()

function getApiKeyFromHeader(req: VercelRequest): string | null {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return null
  return auth.substring(7)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.query.path || ''

  if (path === 'signup') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }
    const { email, plan } = req.body
    if (!email) {
      return res.status(400).json({ error: 'Missing email' })
    }
    const apiKey = 'os_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const now = new Date()
    const resetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString().split('T')[0]
    API_KEYS.set(apiKey, { plan: plan || 'starter', queries: 0, reset: resetDate })
    return res.status(200).json({ 
      success: true, 
      apiKey,
      plan: plan || 'starter',
      limits: plan === 'pro' ? { daily: 'unlimited' } : { daily: 100 }
    })
  }

  if (path === 'check') {
    const apiKey = getApiKeyFromHeader(req)
    if (!apiKey) {
      return res.status(401).json({ error: 'Missing API key', valid: false })
    }
    const keyData = API_KEYS.get(apiKey)
    if (!keyData) {
      return res.status(401).json({ error: 'Invalid API key', valid: false })
    }
    return res.status(200).json({ valid: true, plan: keyData.plan, queries: keyData.queries })
  }

  return res.status(404).json({ error: 'Not found' })
}