import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'
import { CanvasEmpty } from './CanvasEmpty'
import { BlockWrapper } from '@/blocks/BlockWrapper'
import { renderBlock } from '@/blocks/registry'

export function Canvas() {
  const blocks = useConfigStore((s) => s.config.blocks)
  const { selectedBlockId, selectBlock, viewport } = useEditorStore()

  const maxWidth = viewport === 'desktop' ? '880px' : viewport === 'tablet' ? '768px' : '375px'

  if (blocks.length === 0) {
    return <CanvasEmpty />
  }

  return (
    <div className="flex-1 flex items-start justify-center p-6 overflow-auto relative">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--color-bg-3) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Canvas frame */}
      <div
        className="bg-bg-1 border border-border-default rounded-xl min-h-[400px] relative z-[1] overflow-hidden transition-all duration-300"
        style={{ width: '100%', maxWidth }}
        onClick={(e) => {
          if (e.target === e.currentTarget) selectBlock(null)
        }}
      >
        {blocks.map((block) => (
          <BlockWrapper
            key={block.id}
            block={block}
            isSelected={selectedBlockId === block.id}
            onSelect={() => selectBlock(block.id)}
          >
            {renderBlock(block)}
          </BlockWrapper>
        ))}
      </div>
    </div>
  )
}
