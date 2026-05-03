import { resolve } from 'path'
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import type { SiteConfig, BlockConfig } from '../blocks/types'

const OUT_DIR = resolve('./dist-site')

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const defaultTheme: Record<string, string> = {
  bg0: '#09090b', bg1: '#18181b', bg2: '#27272a', bg3: '#3f3f46', bg4: '#52525b', bg5: '#71717a',
  text0: '#fafafa', text1: '#f4f4f5', text2: '#a1a1aa', text3: '#71717a',
  accent: '#22c55e', accentDim: '#16a34a',
  borderDefault: '#3f3f46', borderSubtle: '#27272a', borderHover: '#52525b',
  fontSans: 'DM Sans, system-ui, sans-serif',
  fontDisplay: 'Space Grotesk, system-ui, sans-serif',
  fontMono: 'JetBrains Mono, monospace',
  radius: '8', radiusLg: '16'
}

function renderNavbar(blocks: BlockConfig[], theme: Record<string, string>): string {
  const nav = blocks.find(b => b.type === 'navbar')
  if (!nav) return ''
  const links = (nav.props.links as Array<{label: string, href: string}>) ?? []
  return `<nav class="navbar"><div class="nav-container"><a href="/" class="logo">${escapeHtml(String(nav.props.logo))}</a><ul class="nav-links">${links.map(l => `<li><a href="${l.href}">${escapeHtml(l.label)}</a></li>`).join('')}</ul></div></nav>`
}

function renderHero(blocks: BlockConfig[], theme: Record<string, string>): string {
  const hero = blocks.find(b => b.type === 'hero')
  if (!hero) return ''
  return `<section class="hero"><h1>${escapeHtml(String(hero.props.headline))}</h1><p>${escapeHtml(String(hero.props.subheadline))}</p>${hero.props.cta ? `<a href="${hero.props.ctaLink}" class="btn">${escapeHtml(String(hero.props.cta))}</a>` : ''}</section>`
}

function renderFeatures(blocks: BlockConfig[], theme: Record<string, string>): string {
  const feat = blocks.find(b => b.type === 'features')
  if (!feat) return ''
  const title = feat.props.title as string
  const features = (feat.props.features as Array<{title: string, desc: string, icon: string}>) ?? []
  return `<section class="features"><h2>${escapeHtml(title)}</h2><div class="features-grid">${features.map(f => `<div class="feature-card"><h3>${escapeHtml(f.title)}</h3><p>${escapeHtml(f.desc)}</p></div>`).join('')}</div></section>`
}

function renderStats(blocks: BlockConfig[], theme: Record<string, string>): string {
  const stats = blocks.find(b => b.type === 'stats')
  if (!stats) return ''
  const statItems = (stats.props.stats as Array<{value: string, label: string}>) ?? []
  return `<section class="stats"><div class="stats-grid">${statItems.map(s => `<div class="stat-item"><div class="stat-value">${escapeHtml(s.value)}</div><div class="stat-label">${escapeHtml(s.label)}</div></div>`).join('')}</div></section>`
}

function renderCta(blocks: BlockConfig[], theme: Record<string, string>): string {
  const cta = blocks.find(b => b.type === 'cta')
  if (!cta) return ''
  return `<section class="cta"><h2>${escapeHtml(String(cta.props.headline))}</h2>${cta.props.cta ? `<a href="${cta.props.ctaLink}" class="btn">${escapeHtml(String(cta.props.cta))}</a>` : ''}</section>`
}

function renderFooter(blocks: BlockConfig[], theme: Record<string, string>): string {
  const footer = blocks.find(b => b.type === 'footer')
  if (!footer) return ''
  return `<footer class="footer"><p>&copy; 2026 ${footer.props.description || ''}</p></footer>`
}

function renderContent(blocks: BlockConfig[], theme: Record<string, string>): string {
  const content = blocks.find(b => b.type === 'content')
  if (!content) return ''
  return `<section class="content">${content.props.content || ''}</section>`
}

const blockRenderers: Record<string, (blocks: BlockConfig[], theme: Record<string, string>) => string> = {
  navbar: renderNavbar,
  hero: renderHero,
  features: renderFeatures,
  stats: renderStats,
  cta: renderCta,
  footer: renderFooter,
  content: renderContent,
}

function renderPage(page: {id: string, name: string, path: string, blocks: BlockConfig[]}, theme: Record<string, string>): string {
  const blocks = page.blocks || []
  const renderedSections = blocks.map(b => {
    const renderer = blockRenderers[b.type]
    return renderer ? renderer([b], theme) : ''
  }).join('\n')
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.name} - OpenServe</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg0: ${theme.bg0}; --bg1: ${theme.bg1}; --bg2: ${theme.bg2}; --bg3: ${theme.bg3};
      --text0: ${theme.text0}; --text1: ${theme.text1}; --text2: ${theme.text2};
      --accent: ${theme.accent};
    }
    body { font-family: ${theme.fontSans}; background: var(--bg0); color: var(--text0); line-height: 1.6; }
    .navbar { background: var(--bg1); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 1.5rem; font-weight: 700; color: var(--accent); text-decoration: none; }
    .nav-links { display: flex; gap: 2rem; list-style: none; }
    .nav-links a { color: var(--text1); text-decoration: none; }
    .nav-links a:hover { color: var(--accent); }
    .hero { text-align: center; padding: 6rem 2rem; }
    .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
    .hero p { font-size: 1.25rem; color: var(--text2); margin-bottom: 2rem; }
    .btn { display: inline-block; background: var(--accent); color: white; padding: 0.75rem 1.5rem; border-radius: ${theme.radius}px; text-decoration: none; }
    .features { padding: 4rem 2rem; }
    .features h2 { text-align: center; font-size: 2rem; margin-bottom: 3rem; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto; }
    .feature-card { background: var(--bg1); padding: 2rem; border-radius: ${theme.radius}px; }
    .feature-card h3 { color: var(--accent); margin-bottom: 0.5rem; }
    .stats { padding: 4rem 2rem; background: var(--bg1); }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; max-width: 800px; margin: 0 auto; text-align: center; }
    .stat-value { font-size: 2.5rem; font-weight: 700; color: var(--accent); }
    .stat-label { color: var(--text2); }
    .cta { text-align: center; padding: 4rem 2rem; }
    .cta h2 { font-size: 2rem; margin-bottom: 1rem; }
    .content { padding: 4rem 2rem; max-width: 800px; margin: 0 auto; }
    .content h2 { color: var(--accent); margin: 2rem 0 1rem; }
    .content p { margin-bottom: 1rem; color: var(--text1); }
    .content ul { margin: 1rem 0 1rem 2rem; }
    .content li { margin-bottom: 0.5rem; }
    .content a { color: var(--accent); }
    .footer { text-align: center; padding: 2rem; color: var(--text2); border-top: 1px solid var(--bg2); }
    .ai-container { max-width: 800px; margin: 0 auto; }
    .ai-container h2 { color: var(--accent); margin: 2rem 0 1rem; }
    .chat-box, .research-box { display: flex; gap: 1rem; margin: 1rem 0 2rem; }
    .chat-box input, .research-box input { flex: 1; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg1); color: var(--text0); font-size: 1rem; }
    .chat-box button, .research-box button { padding: 0.75rem 1.5rem; border-radius: 8px; border: none; background: var(--accent); color: white; font-size: 1rem; cursor: pointer; }
    .chat-box button:hover, .research-box button:hover { opacity: 0.9; }
    .chat-box button:disabled, .research-box button:disabled { opacity: 0.5; cursor: not-allowed; }
    .response-box, .results-box { background: var(--bg1); padding: 1.5rem; border-radius: 8px; min-height: 100px; margin-bottom: 2rem; }
    .response-box p { color: var(--text1); margin-bottom: 0.5rem; }
    .results-box ul { margin: 0; padding-left: 1.5rem; }
    .results-box li { color: var(--text1); margin-bottom: 0.5rem; }
    .loading { color: var(--accent); }
    .error { color: #ef4444; }
    .ai-signup { background: var(--bg1); padding: 2rem; border-radius: 8px; margin: 2rem 0; }
    .ai-signup h2 { color: var(--accent); margin-bottom: 1rem; }
    .signup-form { display: flex; gap: 1rem; flex-wrap: wrap; }
    .signup-form input { flex: 1; min-width: 200px; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg0); color: var(--text0); font-size: 1rem; }
    .signup-form select { padding: 0.75rem; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg0); color: var(--text0); font-size: 1rem; }
    .signup-form button { padding: 0.75rem 1.5rem; border-radius: 8px; border: none; background: var(--accent); color: white; font-size: 1rem; cursor: pointer; }
    .signup-form button:hover { opacity: 0.9; }
    #signup-result { margin-top: 1rem; }
    #signup-result .success { color: var(--accent); }
    #signup-result .error { color: #ef4444; }
  </style>
</head>
<body>
${renderedSections}
<script>
const API_BASE = '/api';

async function sendChat() {
  const input = document.getElementById('chat-input');
  const responseBox = document.getElementById('chat-response');
  const btn = responseBox.parentElement.querySelector('button');
  const message = input.value.trim();
  if (!message) return;
  
  btn.disabled = true;
  responseBox.innerHTML = '<p class="loading">Thinking...</p>';
  
  try {
    const res = await fetch(API_BASE + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    if (data.response) {
      responseBox.innerHTML = '<p>' + data.response.replace(/\\n/g, '</p><p>') + '</p>';
    } else {
      responseBox.innerHTML = '<p class="error">' + (data.error || 'Error') + '</p>';
    }
  } catch (e) {
    responseBox.innerHTML = '<p class="error">Failed to connect</p>';
  }
  btn.disabled = false;
}

async function doResearch() {
  const input = document.getElementById('research-input');
  const resultsBox = document.getElementById('research-results');
  const btn = resultsBox.parentElement.querySelector('button');
  const query = input.value.trim();
  if (!query) return;
  
  btn.disabled = true;
  resultsBox.innerHTML = '<p class="loading">Searching...</p>';
  
  try {
    const res = await fetch(API_BASE + '/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    if (data.summary) {
      resultsBox.innerHTML = '<p>' + data.summary.replace(/\\n/g, '</p><p>') + '</p>';
      if (data.searchResults && data.searchResults.length > 0) {
        resultsBox.innerHTML += '<hr><h3>Sources:</h3><ul>' + 
          data.searchResults.map(function(r) { return '<li>' + r + '</li>'; }).join('') + 
          '</ul>';
      }
    } else {
      resultsBox.innerHTML = '<p class="error">' + (data.error || 'Error') + '</p>';
    }
  } catch (e) {
    resultsBox.innerHTML = '<p class="error">Failed to connect</p>';
  }
  btn.disabled = false;
}

document.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    if (document.getElementById('chat-input')) sendChat();
    if (document.getElementById('research-input')) doResearch();
  }
});

async function signup() {
  const email = document.getElementById('signup-email').value.trim();
  const plan = document.getElementById('signup-plan').value;
  const result = document.getElementById('signup-result');
  if (!email) {
    result.innerHTML = '<p class="error">Please enter your email</p>';
    return;
  }
  result.innerHTML = '<p class="loading">Creating account...</p>';
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, plan })
    });
    const data = await res.json();
    if (data.apiKey) {
      localStorage.setItem('os_api_key', data.apiKey);
      localStorage.setItem('os_plan', data.plan);
      result.innerHTML = '<p class="success">Account created! Your API key: ' + data.apiKey + '</p><p>Save this key - you need it to use the AI.</p><button onclick="location.reload()">Go to AI Chat</button>';
    } else {
      result.innerHTML = '<p class="error">' + (data.error || 'Error') + '</p>';
    }
  } catch (e) {
    result.innerHTML = '<p class="error">Failed to connect</p>';
  }
}
</script>
</body>
</html>`
}

function buildSite(config: SiteConfig) {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })
  
  const theme = { ...defaultTheme, ...config.theme } as Record<string, string>
  const pages = config.pages || [{ id: 'page-home', name: 'Home', path: '/', blocks: config.blocks || [] }]
  
  for (const page of pages) {
    const html = renderPage(page, theme)
    const outPath = page.path === '/' ? 'index.html' : page.path.replace(/^\//, '') + '.html'
    writeFileSync(resolve(OUT_DIR, outPath), html)
    console.log(`Built: ${outPath}`)
  }
  
  console.log(`\nSite built to ${OUT_DIR}/`)
  console.log(`${pages.length} pages created`)
}

const configPath = resolve('./src/data/site-config.json')
if (existsSync(configPath)) {
  const config: SiteConfig = JSON.parse(readFileSync(configPath, 'utf-8'))
  buildSite(config)
} else {
  console.error('Config not found:', configPath)
  process.exit(1)
}