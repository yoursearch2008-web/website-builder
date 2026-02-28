import type { SiteConfig, BlockConfig, ThemeConfig } from '@/blocks/types'
import { blockMetadata } from '@/lib/block-metadata'
import { GENERATION_PROMPT } from '@/lib/generation-prompt'
import { getTemplateForPrompt } from '@/lib/templates'

const VALID_BLOCK_TYPES = new Set<string>(blockMetadata.map((b) => b.type))
const VARIANT_MAP = Object.fromEntries(blockMetadata.map((b) => [b.type, new Set(b.variants)]))
const DEFAULT_PROPS_MAP = Object.fromEntries(blockMetadata.map((b) => [b.type, b.defaultProps]))

const GEMINI_MODEL = 'gemini-3-flash-preview'
const STORAGE_KEY = 'openpage-gemini-key'

export async function generateSiteConfig(prompt: string, signal?: AbortSignal): Promise<SiteConfig> {
  // 1. Try client-side Gemini if key exists
  const apiKey = localStorage.getItem(STORAGE_KEY)
  if (apiKey) {
    try {
      return await callGeminiDirect(prompt, apiKey, signal)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') throw err
      // Fall through to server
    }
  }

  // 2. Try server endpoint
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal,
    })

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json') && res.ok) {
      const raw = await res.json()
      return validateSiteConfig(raw, prompt)
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw err
  }

  // 3. Smart fallback template
  return getTemplateForPrompt(prompt)
}

async function callGeminiDirect(prompt: string, apiKey: string, signal?: AbortSignal): Promise<SiteConfig> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `Generate a website configuration for: ${prompt}` }] }],
        systemInstruction: { parts: [{ text: GENERATION_PROMPT }] },
        generationConfig: { responseMimeType: 'application/json', temperature: 0.8 },
      }),
    },
  )

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`)

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty Gemini response')

  return validateSiteConfig(JSON.parse(text), prompt)
}

function isValidHex(s: unknown): s is string {
  return typeof s === 'string' && /^#[0-9a-fA-F]{6}$/.test(s)
}

function validateTheme(raw: Record<string, unknown>): Partial<ThemeConfig> {
  const theme: Partial<ThemeConfig> = {}
  const colorKeys: (keyof ThemeConfig)[] = [
    'bg0', 'bg1', 'bg2', 'bg3', 'bg4', 'bg5',
    'text0', 'text1', 'text2', 'text3',
    'accent', 'accentDim',
    'borderDefault', 'borderSubtle', 'borderHover',
  ]
  const fontKeys: (keyof ThemeConfig)[] = ['fontSans', 'fontDisplay', 'fontMono']

  for (const key of colorKeys) {
    if (isValidHex(raw[key])) {
      (theme as Record<string, unknown>)[key] = raw[key]
    }
  }

  for (const key of fontKeys) {
    if (typeof raw[key] === 'string' && (raw[key] as string).length > 0) {
      (theme as Record<string, unknown>)[key] = raw[key]
    }
  }

  if (typeof raw.radius === 'number' && raw.radius >= 0 && raw.radius <= 24) {
    theme.radius = raw.radius
  }
  if (typeof raw.radiusLg === 'number' && raw.radiusLg >= 0 && raw.radiusLg <= 32) {
    theme.radiusLg = raw.radiusLg
  }

  return theme
}

function validateBlock(raw: Record<string, unknown>, index: number): BlockConfig | null {
  const type = raw.type as string
  if (!type || !VALID_BLOCK_TYPES.has(type)) return null

  const variants = VARIANT_MAP[type]
  let variant = raw.variant as string
  if (!variant || !variants?.has(variant)) {
    variant = blockMetadata.find((b) => b.type === type)?.variants[0] || 'default'
  }

  const defaultProps = DEFAULT_PROPS_MAP[type] || {}
  const props = typeof raw.props === 'object' && raw.props ? { ...defaultProps, ...raw.props } : defaultProps

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : `block-${type}-${index}-${Date.now()}`,
    type: type as BlockConfig['type'],
    variant,
    props: props as Record<string, unknown>,
  }
}

export function validateSiteConfig(raw: unknown, prompt?: string): SiteConfig {
  if (!raw || typeof raw !== 'object') {
    return getTemplateForPrompt(prompt || '')
  }

  const obj = raw as Record<string, unknown>
  const name = typeof obj.name === 'string' ? obj.name : extractNameFromPrompt(prompt)

  let blocks: BlockConfig[] = []
  if (Array.isArray(obj.blocks)) {
    for (let i = 0; i < obj.blocks.length; i++) {
      const block = validateBlock(obj.blocks[i] as Record<string, unknown>, i)
      if (block) blocks.push(block)
    }
  }

  if (blocks.length === 0) {
    return getTemplateForPrompt(prompt || '')
  }

  let theme: Partial<ThemeConfig> | undefined
  if (obj.theme && typeof obj.theme === 'object') {
    theme = validateTheme(obj.theme as Record<string, unknown>)
    if (Object.keys(theme).length === 0) theme = undefined
  }

  return { name, blocks, theme }
}

function extractNameFromPrompt(prompt?: string): string {
  if (!prompt) return 'My Website'
  const words = prompt.split(/\s+/).slice(0, 4).join(' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}
