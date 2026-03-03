# OpenPage

Websites as JSON. Visual editor + AI generation + structured data.

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8.svg)](https://tailwindcss.com/)

**[Live Demo](https://openpage-phi.vercel.app)**

<p align="center">
  <img src="docs/editor-screenshot.png" alt="OpenPage Editor" width="800" />
</p>

---

## Why

Code generation is fragile: LLMs hallucinate imports, break builds, produce unmergeable diffs. Visual editors lock you into proprietary formats that agents can't touch. OpenPage puts a **JSON config** between the two, giving you the best of both worlds: a visual editor for humans and a structured API for AI agents, editing the same source of truth.

## How It Works

```
┌─────────────────┐      ┌──────────────┐      ┌───────────────┐
│  Visual Editor  │◄────►│  JSON Config  │◄────►│   Agent API   │
│  (drag & drop)  │      │ (source of   │      │  (POST /api/  │
│                 │      │   truth)     │      │   generate)   │
└─────────────────┘      └──────┬───────┘      └───────────────┘
                                │
                         ┌──────┴───────┐
                         │   Renderer   │
                         └──────┬───────┘
                                │
                    ┌───────────┴───────────┐
                    │   Deployed Site       │
                    │   (standalone HTML)   │
                    └───────────────────────┘
```

A site is a JSON document. The visual editor reads and writes it. The AI endpoint generates it from a prompt. The renderer turns it into a live page. Export produces a standalone HTML file with zero dependencies.

### The JSON

This is a complete site config. Every site is just blocks + a theme:

```json
{
  "name": "My Startup",
  "theme": {
    "bg0": "#09090b",
    "text0": "#fafafa",
    "accent": "#22c55e",
    "fontSans": "Inter",
    "fontDisplay": "Space Grotesk",
    "radius": 8
  },
  "blocks": [
    {
      "id": "nav-1",
      "type": "navbar",
      "variant": "default",
      "props": {
        "logo": "Acme",
        "links": ["Features", "Pricing", "Docs"],
        "ctaText": "Get Started"
      }
    },
    {
      "id": "hero-1",
      "type": "hero",
      "variant": "centered",
      "props": {
        "badge": "Now in beta",
        "headline": "Ship websites in minutes",
        "subheadline": "JSON config, visual editor, AI generation.",
        "primaryCta": "Start Building"
      }
    },
    {
      "id": "features-1",
      "type": "features",
      "variant": "grid",
      "props": {
        "title": "Everything you need",
        "items": [
          { "icon": "Zap", "title": "Fast", "description": "Sub-second renders" },
          { "icon": "Shield", "title": "Reliable", "description": "Typed JSON schema" },
          { "icon": "Bot", "title": "AI-native", "description": "Agents edit JSON directly" }
        ]
      }
    },
    {
      "id": "footer-1",
      "type": "footer",
      "variant": "minimal",
      "props": { "copyright": "2026 Acme Inc." }
    }
  ]
}
```

Change the JSON, the site updates. No build step, no compilation, no broken imports.

## Blocks

19 block types, 42 variants:

| Block | Variants | Description |
|-------|----------|-------------|
| `navbar` | default, centered | Navigation bar with logo, links, CTA |
| `hero` | centered, split, gradient, minimal | Above-the-fold hero section |
| `features` | grid, list, alternating | Feature cards or list items |
| `pricing` | simple, comparison | Pricing tiers with feature lists |
| `cta` | simple, split | Call-to-action sections |
| `footer` | simple, multi-column, minimal | Site footer with links |
| `testimonials` | cards, carousel, spotlight | Customer quotes and ratings |
| `stats` | grid, bar, counter | Metrics and numbers |
| `faq` | accordion | Expandable Q&A |
| `team` | grid | Team member cards |
| `contact` | form | Contact form |
| `newsletter` | simple | Email signup |
| `logocloud` | default | Company logo grid |
| `content` | prose, columns, highlight | Rich text (markdown) |
| `image` | hero-image, side-by-side, grid | Image layouts |
| `video` | youtube, vimeo | Embedded video |
| `gallery` | grid, masonry | Image gallery |
| `divider` | line, space, dots | Visual separators |
| `banner` | ribbon, bar | Announcement banners |

## Quick Start

```bash
git clone https://github.com/buildingopen/openpage.git
cd openpage
npm install
npm run dev
```

The editor opens at `http://localhost:5173`. Create a site, drag blocks, edit content, export to HTML.

### AI Generation

To enable AI-powered site generation, set your Gemini API key:

```bash
cp .env.example .env
# Add your GEMINI_API_KEY
```

Then deploy to Vercel (the AI endpoint runs as a serverless function):

```bash
vercel
```

### API

`POST /api/generate` with a prompt, get back a complete `SiteConfig` JSON:

```bash
curl -X POST https://your-app.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Landing page for a developer tools startup"}'
```

Returns a full site config with theme, blocks, and content, ready to render.

## Export

JSON to standalone HTML. The exported file is self-contained: inlined styles, Tailwind via CDN, Google Fonts. No build tools, no dependencies, no framework. Open it in a browser, deploy it anywhere.

## Themes

10 built-in presets (Dark Minimal, Ivory, Clean, Sand, Amber, Ocean, Rose, Purple Haze, Slate, Forest), or define your own. Themes are CSS custom properties: backgrounds, text colors, accent, fonts, border radius. Every block respects the theme automatically.

## Comparison

| | Framer | Lovable | v0 | OpenPage |
|---|---|---|---|---|
| Source of truth | Proprietary visual | Generated code | Generated code | **JSON config** |
| Agent-editable | No | Prompt only | Prompt only | **Structured API** |
| Human-editable | Visual editor | Code/prompt | Code | **Visual + JSON** |
| Predictable edits | Yes | No | No | **Yes** |
| Version control | Limited | Git (messy diffs) | No | **Git (clean diffs)** |

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript 5.9](https://www.typescriptlang.org/)
- [Vite 7](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Zustand](https://zustand.docs.pmnd.rs/) + [Immer](https://immerjs.github.io/immer/) (state management)
- [@dnd-kit](https://dndkit.com/) (drag and drop)
- [Lucide](https://lucide.dev/) (icons)
- [Gemini](https://ai.google.dev/) (AI generation backend)

## Contributing

PRs welcome. Before submitting:

```bash
npm run lint    # ESLint
npm run build   # TypeScript + Vite build
npm run test    # Vitest
```

## License

[MIT](LICENSE)
