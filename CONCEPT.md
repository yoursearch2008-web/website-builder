# OpenPage

**Websites as JSON config.** Like n8n workflows, a website becomes a structured config. Components like shadcn. Agents can make changes, humans too.

## Architecture

```
[Visual Editor] <--> [JSON Config] <--> [Agent API]
                          |
                     [Renderer]
                          |
                   [Deployed Site]
```

The JSON config is the **single source of truth**. Everything reads from and writes to it.

## What This Is

A mix of **Framer** (visual design, drag-and-drop) and **Lovable** (AI-assisted building) - but with a structured JSON layer in between that makes both human and agent edits reliable.

- **Not code generation** - agents editing code leads to hallucinations, merge conflicts, broken builds
- **Not a visual-only tool** - proprietary visual formats lock out agents
- **JSON is the universal interface** - surgical edits by agents, visual edits by humans, version control for free

## Core Concepts

### 1. JSON Config (the product)
Every website is a JSON document. Components, layout, content, styles, interactions - all structured data. The schema is strict enough that any valid edit produces a valid site.

### 2. Component Library
shadcn-style components: Hero, Features, Pricing, CTA, Footer, etc. Each component has a typed schema. The JSON references component types + props, the renderer resolves them.

### 3. Dual Editor
- **Visual**: drag blocks, edit text inline, change colors (Framer-like)
- **Agent**: API endpoint accepts JSON patches, natural language instructions get translated to config changes
- Both produce the same JSON mutations

### 4. Renderer
JSON config compiles to a live site. Could be:
- Real-time preview (React renderer)
- Static export (HTML/CSS)
- Framework export (Next.js project)

## Differentiators

| | Framer | Lovable | v0 | OpenPage |
|---|---|---|---|---|
| Source of truth | Proprietary visual | Generated code | Generated code | **JSON config** |
| Agent-editable | No | Prompt only | Prompt only | **Structured API** |
| Human-editable | Visual editor | Code/prompt | Code | **Visual + JSON** |
| Predictable edits | Yes | No | No | **Yes** |
| Version control | Limited | Git (messy diffs) | No | **Git (clean diffs)** |

## Open Questions

- Where's the line between expressiveness and structure? Custom animations? Conditional logic? Responsive breakpoints?
- Runtime renderer vs. build-time compilation vs. both?
- Component marketplace / community components?
- Hosting model: deploy to Vercel/Netlify, or self-hosted renderer?

## Lineage

Evolved from `federicodeponte/prompt-to-website` (Nov 2025). That project had AI generate websites from prompts, but JSON was an output, not the source of truth. OpenPage flips this: JSON config IS the product.

## Model

- **SaaS**: hosted editor + deploy + agent API
- **Open source**: JSON schema + renderer + CLI

---

Repo: `federicodeponte/openpage`
