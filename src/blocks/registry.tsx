import type { BlockConfig, BlockType } from './types'
import type { ReactNode } from 'react'

// Wireframe-style placeholder blocks (replaced in v0.6.0 with real components)
function WireframeBlock({ block }: { block: BlockConfig }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props = block.props as Record<string, any>

  switch (block.type) {
    case 'navbar':
      return (
        <div className="px-9 py-4 flex items-center gap-6">
          <span className="font-semibold text-sm">{String(props.logo || 'Logo')}</span>
          <div className="flex gap-4 ml-auto text-xs text-text-2">
            {(props.links as string[] || []).map((link, i) => (
              <span key={i} className="hover:text-text-0 transition-colors cursor-pointer">{link}</span>
            ))}
          </div>
          <button className="px-3 py-1 rounded-md bg-green text-black text-xs font-semibold">
            {String(props.ctaText || 'CTA')}
          </button>
        </div>
      )

    case 'hero':
      return (
        <div className="text-center px-9 py-10">
          {props.badge && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-green mb-1 block">
              {String(props.badge)}
            </span>
          )}
          <h2 className="text-[26px] font-bold tracking-tight mb-1.5">
            {String(props.headline || 'Headline')}
          </h2>
          <p className="text-text-2 text-[13.5px] max-w-[440px] mx-auto mb-3.5">
            {String(props.subheadline || 'Subheadline')}
          </p>
          <div className="flex gap-2 justify-center">
            <button className="px-3.5 py-1.5 rounded-md bg-green text-black text-[12.5px] font-semibold">
              {String(props.primaryCta || 'Primary')}
            </button>
            {props.secondaryCta && (
              <button className="px-3.5 py-1.5 rounded-md bg-bg-3 text-text-1 text-[12.5px] font-medium border border-border-default">
                {String(props.secondaryCta)}
              </button>
            )}
          </div>
        </div>
      )

    case 'features': {
      const items = (props.items as Array<{ icon?: string; title: string; description: string }>) || []
      return (
        <div className="px-9 py-7">
          {props.label && (
            <div className="text-[10px] font-semibold uppercase tracking-widest text-green mb-0.5">
              {String(props.label)}
            </div>
          )}
          <div className="text-lg font-bold tracking-tight mb-1">{String(props.title || 'Title')}</div>
          <div className="text-text-2 text-[12.5px] mb-3.5">{String(props.subtitle || '')}</div>
          <div className="grid grid-cols-3 gap-3">
            {items.map((item, i) => (
              <div key={i} className="bg-bg-2 border border-border-default rounded-lg p-4">
                <div className="w-7 h-7 rounded-md bg-green-glow text-green flex items-center justify-center text-[13px] mb-2">
                  {(item.icon || '?')[0]}
                </div>
                <h4 className="text-[12.5px] font-semibold mb-0.5">{item.title}</h4>
                <p className="text-[11px] text-text-2 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'pricing':
      return (
        <div className="px-9 py-7 text-center">
          <div className="text-lg font-bold tracking-tight mb-1">{String(props.title || 'Pricing')}</div>
          <div className="text-text-2 text-[12.5px] mb-4">{String(props.subtitle || 'Choose your plan')}</div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`bg-bg-2 border rounded-lg p-4 ${i === 2 ? 'border-green' : 'border-border-default'}`}>
                <div className="text-[12px] font-semibold mb-1">Plan {i}</div>
                <div className="text-xl font-bold mb-2">${i * 10}/mo</div>
                <button className={`w-full py-1.5 rounded-md text-xs font-semibold ${i === 2 ? 'bg-green text-black' : 'bg-bg-3 text-text-1'}`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      )

    case 'cta':
      return (
        <div className="px-9 py-10 text-center bg-green-glow2">
          <div className="text-lg font-bold tracking-tight mb-1">{String(props.headline || 'CTA')}</div>
          <div className="text-text-2 text-[12.5px] mb-3">{String(props.subheadline || '')}</div>
          <button className="px-4 py-2 rounded-md bg-green text-black text-[12.5px] font-semibold">
            {String(props.buttonText || 'Get Started')}
          </button>
        </div>
      )

    case 'footer':
      return (
        <div className="px-9 py-6 flex items-center justify-between text-[11px] text-text-3">
          <span className="font-semibold text-text-2">{String(props.logo || 'Logo')}</span>
          <span>{String(props.copyright || '')}</span>
          <div className="flex gap-3">
            {(props.links as string[] || []).map((link, i) => (
              <span key={i} className="hover:text-text-1 transition-colors cursor-pointer">{link}</span>
            ))}
          </div>
        </div>
      )

    default:
      return (
        <div className="px-9 py-7 text-center text-text-3 text-sm">
          {block.type} block (coming soon)
        </div>
      )
  }
}

const blockRenderers: Record<string, React.ComponentType<{ block: BlockConfig }>> = {}

export function registerBlock(type: BlockType, component: React.ComponentType<{ block: BlockConfig }>) {
  blockRenderers[type] = component
}

export function renderBlock(block: BlockConfig): ReactNode {
  const Renderer = blockRenderers[block.type]
  if (Renderer) return <Renderer block={block} />
  return <WireframeBlock block={block} />
}
