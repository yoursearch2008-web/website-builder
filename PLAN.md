# OpenPage: Road to 10/10

## Context

OpenPage is at **7.5/10**. The editor is well-wired (all 13 blocks have property editors, persistence works, undo/redo is real, JSON drawer is bidirectional, drag-and-drop works). What's missing: more blocks for real websites, scroll animations, better AI generation, HTML export, and polish. This plan takes it to 10/10 in 6 iterations.

**Scoring: Ralph Wiggum Scale**
- 7.5: "I bent my wookiee" (current, decent but gaps)
- 8.0: "Lisa, vampires are make-believe, like elves and gremlins" (animations + utility blocks)
- 8.5: "I heard your dad went into a restaurant" (content blocks fill real gaps)
- 9.0: "Me fail English? That's unpossible!" (AI generation works for real)
- 9.3: "The doctor said I wouldn't have so many nose bleeds if I kept my finger outta there" (can export actual websites)
- 9.7: "When I grow up, I'm going to Bovine University!" (polished, accessible)
- 10.0: "I'm a unitard!" (perfection)

---

## Registration Pattern (every new block touches 6 files)

1. `src/blocks/types.ts` - add to `BlockType` union
2. `src/blocks/{type}/{Type}Block.tsx` - new component
3. `src/blocks/registry.tsx` - import + add to `blockRenderers`
4. `src/lib/block-metadata.ts` - add metadata entry (variants, defaultProps, category)
5. `src/editor/PropertiesPanel.tsx` - add to `blockFields` with full field sections, and `blockTemplates` for array-items
6. `src/editor/LayersPanel.tsx` - add to `blockIcons` + `blockLabels`

### Additional touchpoints per block:
7. `src/lib/generate-site.ts` - `VALID_BLOCK_TYPES` is derived from `blockMetadata` automatically (no manual change needed)
8. `api/generate.ts` - update `systemPrompt` to include new block types/variants/props so Gemini knows about them

---

## Iteration 1: Scroll Animations + Utility Blocks (7.5 -> 8.0)

Highest visual impact. Every existing block becomes more impressive. Utility blocks fill essential layout gaps.

### 1A. Scroll-triggered entrance animations

**New file: `src/lib/useScrollReveal.ts`**
- Custom hook returning `{ ref, isRevealed }`
- IntersectionObserver with threshold 0.15, rootMargin "-60px"
- Once revealed, stays revealed (no re-hide)
- Accepts `disabled?: boolean` param; when true, `isRevealed` is always `true`

**Modify: `src/blocks/BlockWrapper.tsx`**
- Attach `useScrollReveal` with `disabled={previewMode}` to the wrapper div
- Apply `opacity-0 translate-y-4` when not revealed, CSS transition (0.5s cubic-bezier) to fade in + translate up
- Preview mode: still returns bare `<div>` (existing behavior), so scroll reveal never fires
- Components page: calls `renderBlock()` directly, bypasses BlockWrapper entirely, no interference
- Remove old `block-enter` class from the wrapper div

**Modify: `src/index.css`**
- Remove `block-enter` animation (replaced by scroll reveal)

### 1B. Divider block

**New file: `src/blocks/divider/DividerBlock.tsx`**

3 variants:
- `line` - thin border-t, configurable width (full/centered/narrow)
- `space` - pure vertical spacing (height prop: 40-200px)
- `dots` - three centered dots separator

Props: `{ height?: number, width?: 'full' | 'centered' | 'narrow' }`

**Registration (6 files):**

`types.ts`: Add `'divider'` to BlockType union

`block-metadata.ts`:
```ts
{ type: 'divider', label: 'Divider', description: 'Visual separator between sections',
  category: 'Layout', variants: ['line', 'space', 'dots'],
  defaultProps: { height: 60, width: 'full' } }
```

`PropertiesPanel.tsx` blockFields:
```ts
divider: {
  sections: [
    { title: 'Style', fields: [
      { key: 'variant', label: 'Variant', type: 'select', options: ['line', 'space', 'dots'] },
      { key: 'width', label: 'Width', type: 'select', options: ['full', 'centered', 'narrow'] },
      { key: 'height', label: 'Height (px)', type: 'text' },
    ]},
  ],
}
```

`LayersPanel.tsx`:
- blockIcons: `divider: Minus` (from lucide-react)
- blockLabels: `divider: 'Divider'`

`registry.tsx`: import + add `divider: DividerBlock`

`api/generate.ts`: Add divider to systemPrompt block list

### 1C. Banner block

**New file: `src/blocks/banner/BannerBlock.tsx`**

2 variants:
- `ribbon` - full-width colored bar with text + optional link
- `bar` - bordered card-style with subtle background

Props: `{ text: string, linkText?: string, linkUrl?: string, dismissible?: boolean }`

**Registration (6 files):** Same pattern as divider.

`block-metadata.ts`:
```ts
{ type: 'banner', label: 'Banner', description: 'Announcement bar or ribbon',
  category: 'Content', variants: ['ribbon', 'bar'],
  defaultProps: { text: 'New: We just launched v2.0!', linkText: 'Learn more' } }
```

`PropertiesPanel.tsx` blockFields:
```ts
banner: {
  sections: [
    { title: 'Content', fields: [
      { key: 'text', label: 'Text', type: 'text' },
      { key: 'linkText', label: 'Link Text', type: 'text' },
      { key: 'linkUrl', label: 'Link URL', type: 'text' },
    ]},
    { title: 'Style', fields: [
      { key: 'variant', label: 'Variant', type: 'select', options: ['ribbon', 'bar'] },
    ]},
  ],
}
```

`LayersPanel.tsx`: `banner: Flag` icon, `banner: 'Banner'` label

### Verify
- `npm run build` passes
- Scroll down a multi-block page in editor, blocks animate in
- Preview mode: all blocks visible immediately (existing behavior, BlockWrapper returns bare div)
- Divider renders in all 3 variants
- Banner renders in both variants
- Components page shows new blocks with previews (no scroll-reveal interference)

---

## Iteration 2: Content Blocks + New Variants (8.0 -> 8.5)

Fill content gaps. Without these, users can only build marketing pages.

### 2A. Content block

**New file: `src/blocks/content/ContentBlock.tsx`**

3 variants:
- `prose` - single column rendered text (basic markdown)
- `columns` - two-column text layout
- `highlight` - text with left accent border + subtle bg

Props: `{ body: string }`

**New file: `src/lib/markdown.ts`** - Simple markdown-to-React-elements renderer
- Parse: `**bold**`, `*italic*`, `## headers`, `- lists`, `\n` line breaks
- Returns `ReactNode[]`, NOT raw HTML strings (no `dangerouslySetInnerHTML`, no XSS risk)
- Implementation: regex-based split-and-wrap into React `createElement` calls, ~80 lines
- No external deps

**PropertiesPanel blockFields:**
```ts
content: {
  sections: [
    { title: 'Content', fields: [
      { key: 'body', label: 'Body', type: 'textarea' },
    ]},
    { title: 'Style', fields: [
      { key: 'variant', label: 'Variant', type: 'select', options: ['prose', 'columns', 'highlight'] },
    ]},
  ],
}
```

`blockMetadata`:
```ts
{ type: 'content', label: 'Content', description: 'Rich text content section',
  category: 'Content', variants: ['prose', 'columns', 'highlight'],
  defaultProps: { body: '## Getting Started\n\nWrite your content here. Supports **bold**, *italic*, and lists.\n\n- First item\n- Second item\n- Third item' } }
```

No `blockTemplates` entry needed (no array-items fields).

### 2B. Image block

**New file: `src/blocks/image/ImageBlock.tsx`**

3 variants:
- `hero-image` - full-width with optional text overlay
- `side-by-side` - image + text, configurable side (left/right)
- `grid` - 2-4 images in responsive grid

Props: `{ src?: string, alt?: string, title?: string, subtitle?: string, images?: { src: string, alt: string }[], imageSide?: 'left' | 'right' }`

Placeholder: gradient div with Image icon when no src

**PropertiesPanel blockFields:**
```ts
image: {
  sections: [
    { title: 'Content', fields: [
      { key: 'src', label: 'Image URL', type: 'text' },
      { key: 'alt', label: 'Alt Text', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'imageSide', label: 'Image Side', type: 'select', options: ['left', 'right'] },
    ]},
    { title: 'Grid Images', fields: [
      { key: 'images', label: 'Images', type: 'array-items' },
    ]},
    { title: 'Style', fields: [
      { key: 'variant', label: 'Variant', type: 'select', options: ['hero-image', 'side-by-side', 'grid'] },
    ]},
  ],
}
```

**PropertiesPanel `blockTemplates`** (add to existing object at line ~326):
```ts
image: { images: { src: '', alt: '' } },
```

### 2C. Video block

**New file: `src/blocks/video/VideoBlock.tsx`**

2 variants: `youtube`, `vimeo`

Extract video ID from URL, render responsive iframe. Placeholder with Play icon when no URL.

Props: `{ url: string, title?: string }`

**Iframe security requirements:**
- `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"`
- `allowFullScreen`
- YouTube: use `youtube-nocookie.com` domain
- URL validation: only embed if matches `youtube.com`, `youtu.be`, or `vimeo.com` patterns; otherwise show "Invalid URL" message
- Responsive wrapper: `aspect-ratio: 16/9` (CSS property, no padding hack)

**PropertiesPanel blockFields:**
```ts
video: {
  sections: [
    { title: 'Content', fields: [
      { key: 'url', label: 'Video URL', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
    ]},
    { title: 'Style', fields: [
      { key: 'variant', label: 'Platform', type: 'select', options: ['youtube', 'vimeo'] },
    ]},
  ],
}
```

### 2D. Gallery block

**New file: `src/blocks/gallery/GalleryBlock.tsx`**

2 variants:
- `grid` - even grid of image cards
- `masonry` - alternating tall/short cards via CSS grid span

Props: `{ title?: string, images?: { src?: string, alt?: string, caption?: string }[] }`

Default: 6 placeholder images with gradient accent backgrounds

**PropertiesPanel blockFields:**
```ts
gallery: {
  sections: [
    { title: 'Content', fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'images', label: 'Images', type: 'array-items' },
    ]},
    { title: 'Style', fields: [
      { key: 'variant', label: 'Variant', type: 'select', options: ['grid', 'masonry'] },
    ]},
  ],
}
```

**PropertiesPanel `blockTemplates`:**
```ts
gallery: { images: { src: '', alt: '', caption: '' } },
```

### 2E. New variants for existing blocks

| Block | New Variant | Description | Prop Compatibility |
|-------|-------------|-------------|-------------------|
| hero | `minimal` | Oversized headline, single CTA, lots of whitespace | Uses existing props. Ignores `badge` and `secondaryCta`. |
| features | `alternating` | Zigzag image-text layout | Reads optional `item.image` if present. Items are `Record<string, unknown>`, so new keys are fine. Existing items without `image` show a placeholder. |
| testimonials | `spotlight` | Single large testimonial, big quote mark | Renders only `items[0]`. No prop change. |
| navbar | `centered` | Logo center, links split left/right | Splits existing `links` array: first half left, second half right. |
| stats | `counter` | Numbers with accent background cards | Uses existing `items` array. Different styling only. |

**Files per variant (3 files each):**
1. Block component file (add new variant case to the switch/conditional)
2. `block-metadata.ts` (append variant string to variants array)
3. `PropertiesPanel.tsx` (append variant to options array in the variant select field)

### 2F. Update `api/generate.ts` systemPrompt

Add all 4 new block types (content, image, video, gallery) and 2 new utility blocks (divider, banner) with their variants and props to the `systemPrompt`. Also add new variants for existing blocks (hero/minimal, features/alternating, testimonials/spotlight, navbar/centered, stats/counter).

### Verify
- `npm run build` passes
- All 4 new block types render in Components page
- All 5 new variants render correctly
- Container queries work on all new blocks (test mobile viewport)
- Content block renders basic markdown (bold, italic, headers, lists)
- Video embed works with YouTube URL (uses youtube-nocookie.com domain)
- Properties panel edits all new block props
- Array-items for `image.images` and `gallery.images` create correct empty item shapes
- AI generation prompt includes all new block types and variants

---

## Iteration 3: Client-side AI Generation (8.5 -> 9.0)

The prompt flow is the hero feature. Make it work without a backend.

### 3A. Client-side Gemini integration

**Modify: `src/lib/generate-site.ts`**

New flow:
1. Check localStorage for Gemini API key (`openpage-gemini-key`)
2. If key exists: call Gemini directly from browser
3. If no key: try `/api/generate` (existing Vercel serverless endpoint)
4. If both fail: smart fallback template (from 3B)

**New file: `src/lib/generation-prompt.ts`**
- Contains the full system prompt string with all 19 block types
- Used by client-side Gemini call in `generate-site.ts`
- `api/generate.ts` keeps its own copy of the prompt (serverless functions can't import from `src/`)

**Client-side Gemini call in `generate-site.ts`:**
```ts
async function callGeminiDirect(prompt: string, apiKey: string, signal?: AbortSignal): Promise<SiteConfig> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `Generate a website configuration for: ${prompt}` }] }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: { responseMimeType: 'application/json', temperature: 0.8 },
      }),
    }
  )
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty Gemini response')
  return validateSiteConfig(JSON.parse(text), prompt)
}
```

### 3B. Smart fallback templates

**New file: `src/lib/templates.ts`**

5 template configs, keyword-matched from prompt:

| Template | Keywords | Theme Preset | Key Blocks |
|----------|----------|-------------|------------|
| SaaS (default) | "saas", "app", "software", "startup" | `default` (dark green) | navbar, hero/centered, features/grid, pricing/simple, testimonials/cards, cta, footer |
| Portfolio | "portfolio", "personal", "resume", "freelance" | `slate` (cyan accent) | navbar, hero/minimal, gallery/grid, content/prose, stats/grid, contact, footer |
| Restaurant | "restaurant", "food", "cafe", "bakery", "bar" | `amber` (warm amber) | navbar, hero/gradient, features/list, gallery/masonry, testimonials/spotlight, cta, footer |
| Agency | "agency", "studio", "consulting", "firm" | `clean` (white, blue) | navbar/centered, hero/split, features/alternating, stats/counter, testimonials/cards, cta/split, footer |
| Blog | "blog", "newsletter", "magazine", "journal" | `ivory` (warm, indigo) | navbar, hero/minimal, content/columns, newsletter, faq, footer |

Each template: realistic copy tailored to the template type, `name` extracted from user prompt.

### 3C. API key settings

**Modify: `src/routes/Settings.tsx`**

Replace the existing `ApiPanel` component (currently shows "coming soon") with:
- Gemini API key input field with show/hide toggle
- Store in localStorage key `openpage-gemini-key` (user-level, not project-level)
- "Test" button: makes minimal Gemini `models.list` call to validate key, shows success/error toast
- Keep "Programmatic API access coming in future release" text below

### Verify
- No API key, no server: generates from smart template matching; theme matches template type
- With localStorage key: calls Gemini directly, returns valid config
- With server key only (Vercel env): falls back to `/api/generate`
- Generated configs include new block types from Iterations 1-2
- All generated sites render without errors
- API key persists across page refreshes (localStorage)
- Settings API tab shows key input, test button works

---

## Iteration 4: Static HTML Export (9.0 -> 9.3)

Export is how users ship. JSON export works, HTML export makes OpenPage useful.

### 4A. HTML export engine

**New file: `src/lib/export-html.ts`**

**Approach: Stylesheet extraction from document**

Tailwind v4 compiles `@theme` tokens and `@utility` directives into `<style>` tags via `@tailwindcss/vite`. DOM cloning alone loses this. The strategy:

1. **Extract compiled CSS:** Read all `<style>` tags from `document.head` (Vite injects compiled Tailwind here). Use `styleElement.textContent` (not `cssRules`, which can be CORS-blocked on `<link>` tags).
2. **Render blocks to string:** Create a temporary div, use `createRoot` to render all blocks (without BlockWrapper editor chrome) inside it. Wait for render via `flushSync`.
3. **Capture innerHTML** of the rendered blocks.
4. **Inject theme CSS vars:** Use `themeToCSS()` from `theme-presets.ts` to generate inline `style` attribute on `<body>` with all theme custom properties.
5. **Assemble standalone HTML:**
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>{siteName}</title>
     <link href="https://fonts.googleapis.com/css2?family={fontSans}&family={fontDisplay}&display=swap" rel="stylesheet">
     <style>{extractedCSS}</style>
   </head>
   <body style="{themeVarsInline}">
     {blockHTML}
   </body>
   </html>
   ```
6. Clean up temporary div.

**Why `textContent` over `cssRules`:** `cssRules` throws SecurityError on cross-origin stylesheets (e.g., Google Fonts `<link>`). `textContent` works for `<style>` tags (which is where Vite puts compiled Tailwind). Google Fonts CSS is linked separately in the export HTML `<head>`.

### 4B. Wire Deploy page

**Modify: `src/routes/Deploy.tsx`**
- Move "Static HTML" from `plannedOptions` to `readyOptions` with `action: 'html'`
- Wire `handleExport('html')`:
  1. Call `exportToHTML(config, theme)` from `export-html.ts`
  2. Create Blob, trigger download as `{siteName}.html`
- Add "Preview" option: opens HTML in new tab via `URL.createObjectURL(blob)` + `window.open()`
- Keep Netlify and Next.js in `plannedOptions`

### Verify
- Click "Static HTML" on Deploy page, `.html` file downloads
- Open downloaded file in browser, renders correctly
- Theme colors, fonts, responsive behavior all work standalone
- No editor chrome in exported HTML
- Google Fonts load in the exported file
- "Preview" opens a new tab with correct rendering

---

## Iteration 5: Polish + Accessibility (9.3 -> 9.7)

The difference between good and great.

### 5A. Page transitions

**New file: `src/lib/PageTransition.tsx`**
- Wrapper component, applies 200ms fade-in-up on route mount
- Use in `App.tsx`: wrap route outlet with `<PageTransition key={location.pathname}>`

### 5B. Skeleton loading states

**New file: `src/components/Skeleton.tsx`**
- Reusable skeleton component using existing `@keyframes shimmer` from `index.css`
- Apply to: Components page mini-previews on initial render, Dashboard project cards

### 5C. Accessibility

Across all interactive elements:
- `aria-label` on icon-only buttons (BlockWrapper: "Move up", "Move down", "Duplicate", "Delete"; LayersPanel: "Duplicate", "Remove", "Drag to reorder")
- Keyboard navigation through layers panel (arrow keys to move between layers)
- `role="region"` + `aria-live="polite"` on Canvas container
- Focus trap in ShortcutsModal (Tab cycles within modal)
- Skip-to-content link in AppLayout (`<a href="#main-content" className="sr-only focus:not-sr-only">`)
- Logical tab order: left sidebar -> canvas -> right sidebar

### 5D. Focus ring consistency

- Current global rule: `*:focus-visible { outline: 2px solid green; outline-offset: 2px }` (good)
- Fix textarea: currently `textarea:focus-visible { outline: none }`, change to `border-color: green` instead
- Audit all components for any `outline-none` that removes focus-visible (search codebase)
- Replace any found with proper focus-visible styles

### 5E. Micro-interactions

- Block selection: subtle scale pulse on select (`transform: scale(1.005)` for 150ms, then back)
- Undo/redo: brief green highlight flash on affected block (200ms bg-green-glow2 flash)
- Add block: smooth scroll to new block (already partially done in BlockWrapper's `useEffect`)
- Theme preset switch: brief 200ms crossfade transition on canvas (opacity transition on the `@container` div)

### Verify
- Tab through entire app with keyboard only, all interactive elements reachable
- Focus states visible on every interactive element
- Page transitions smooth, no layout shift
- `npm run build` zero warnings

---

## Iteration 6: Final Spit-Shine (9.7 -> 10.0)

Feature completeness, edge cases, the last details.

### 6A. Block factory + Enhanced demo agent

**New file: `src/lib/block-factory.ts`**
```ts
import { blockMetadata } from './block-metadata'
import type { BlockType, BlockConfig } from '@/blocks/types'

export function createBlock(type: BlockType, overrides?: Partial<Pick<BlockConfig, 'variant' | 'props'>>): BlockConfig {
  const meta = blockMetadata.find(b => b.type === type)
  if (!meta) throw new Error(`Unknown block type: ${type}`)
  return {
    id: `block-${type}-${Date.now()}`,
    type,
    variant: overrides?.variant || meta.variants[0],
    props: { ...meta.defaultProps, ...overrides?.props },
  }
}
```

Consolidate usage: replace inline block creation in `LayersPanel.handleAddBlock()` (line ~181) and `Components.handleAdd()` (line ~24) with `createBlock()`.

**Modify: `src/editor/AgentPanel.tsx`**

Expand `generateResponse()` to handle via client-side pattern matching:

| User Input | Action | Store Call |
|-----------|--------|------------|
| "add a pricing section" | `createBlock('pricing')` | `configStore.addBlock(block)` |
| "add a gallery" | `createBlock('gallery')` | `configStore.addBlock(block)` |
| "remove the FAQ" / "delete the FAQ" | Find block by type | `configStore.removeBlock(id)` |
| "make the hero a split layout" | Find hero block | `configStore.updateBlock(id, { variant: 'split' })` |
| "make it blue" / "switch to ocean theme" | Find preset by name/color keyword | `configStore.setTheme(preset.theme)` |
| "change the headline to X" | Existing behavior | `configStore.updateBlockProps(id, { headline: X })` |

Import `themePresets` from `theme-presets.ts` for theme matching. Each action generates a proper patch message for the chat UI.

### 6B. Duplicate project

**Modify: `src/store/projectsStore.ts`** - add `duplicateProject(id: string): string`
- Deep clone project, generate new ID, append " (copy)" to name, set status to 'draft'

**Modify: `src/routes/Dashboard.tsx`** - add duplicate button on project cards

### 6C. Migration safety for existing saved configs

**Modify: `src/store/configStore.ts`** - add Zustand persist `version`:

```ts
persist(
  (set, get) => ({ ... }),
  {
    name: 'openpage-config',
    version: 2,
    migrate: (persisted, version) => {
      // v0/v1 -> v2: new block types are additive, no breaking changes
      // Old configs with only original 13 types still work perfectly
      return persisted as any
    },
    partialize: (state) => ({ config: state.config }),
  }
)
```

**Why existing configs are safe:**
- `BlockType` union expands but old values remain valid
- `blockRenderers` has `PlaceholderBlock` fallback for unknown types
- `VALID_BLOCK_TYPES` auto-derives from `blockMetadata` at runtime
- `useScrollReveal` hook has no required props on block data
- No variant renames for existing blocks (all new variants are additive)
- Old saved configs simply won't contain new block types, which is correct

### 6D. Edge cases

- **Empty filter results on Components page:** Add empty state message when category filter yields 0 results (the `AddComponentPopover` already has this, but the main Components grid does not)
- **Unsaved changes warning:** Add `beforeunload` event listener in editor that warns if config has changed since last save/load
- **Long block lists:** Test with 20+ blocks to verify scroll performance (likely fine, no virtualization needed for <50 blocks)

### 6E. Final audit

- `npm run build` - zero errors, zero warnings
- Bundle size check
- Remove unused imports/dead code
- Verify localStorage persistence: `openpage-config`, `openpage-projects`, `openpage-gemini-key`
- Test all 19 block types in all viewports (desktop/tablet/mobile via CanvasToolbar)
- Test AI generation flow end-to-end: with key, without key, with server, without server
- Test HTML export end-to-end: download, open in browser, verify rendering
- Verify all 5 smart templates generate correctly

### Verify
- Every feature works
- Every edge case handled
- Every screen beautiful at every viewport
- Ralph says "I'm a unitard!"

---

## Summary

| Iter | Score | Theme | New Blocks | New Variants | Key Files |
|------|-------|-------|------------|--------------|-----------|
| 1 | 8.0 | Scroll animations + utility | divider, banner | - | useScrollReveal.ts, BlockWrapper.tsx, index.css |
| 2 | 8.5 | Content blocks + variants | content, image, video, gallery | 5 new | markdown.ts, 4 block dirs, api/generate.ts |
| 3 | 9.0 | AI generation | - | - | generate-site.ts, templates.ts, generation-prompt.ts, Settings.tsx |
| 4 | 9.3 | HTML export | - | - | export-html.ts, Deploy.tsx |
| 5 | 9.7 | Polish + a11y | - | - | PageTransition.tsx, Skeleton.tsx, many small edits |
| 6 | 10.0 | Final spit-shine | - | - | block-factory.ts, AgentPanel.tsx, projectsStore.ts, configStore.ts |

**Final block count: 19 types, 33+ variants**
**Total new files: ~14 | Total files touched: ~30**

---

## Gap Fixes Applied (from pre-implementation review)

1. **Block factory function** (Gap: agent can't create valid blocks): Added `src/lib/block-factory.ts` in 6A. Creates valid BlockConfigs from type name using blockMetadata. Also consolidates existing inline block creation in LayersPanel/Components.

2. **Full PropertiesPanel field specs** (Gap: plan undersold registration work): Every new block now has complete `blockFields` sections specified, including `blockTemplates` entries for `image.images` and `gallery.images` array-items.

3. **Scroll animations vs Components page** (Gap: IntersectionObserver on mini-previews): Components page calls `renderBlock()` directly, bypassing BlockWrapper entirely. No interference. Added `disabled` param to `useScrollReveal`.

4. **HTML export Tailwind v4 strategy** (Gap: DOM cloning loses compiled styles): Uses `<style>` tag `textContent` extraction (not `cssRules` which is CORS-blocked). Injects theme vars via `themeToCSS()`. Links Google Fonts separately.

5. **VALID_BLOCK_TYPES auto-update** (Gap: new types rejected by validation): Already auto-derived from `blockMetadata`. Added explicit step 2F to update `api/generate.ts` systemPrompt.

6. **New variant prop compatibility** (Gap: some variants need different props): Added "Prop Compatibility" column. All new variants work with existing prop shapes. `features/alternating` reads optional `item.image`. `testimonials/spotlight` picks `items[0]`. `navbar/centered` splits existing `links` array.

7. **Markdown renderer security** (Gap: XSS via dangerouslySetInnerHTML): Returns `ReactNode[]` via regex split-and-wrap. No raw HTML injection, no XSS surface.

8. **Video iframe security** (Gap: missing sandbox attributes): Specified `allow` attributes, `youtube-nocookie.com`, URL validation pattern, `aspect-ratio: 16/9`.

9. **Template theme matching** (Gap: all templates look the same): Each template maps to an existing theme preset. SaaS->default, Portfolio->slate, Restaurant->amber, Agency->clean, Blog->ivory.

10. **Migration path for saved configs** (Gap: old localStorage breaks): Added Zustand persist `version` + `migrate` in 6C. Explained why changes are additive and non-breaking.
