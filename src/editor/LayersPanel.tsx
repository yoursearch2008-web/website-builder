import {
  Layout, Type, Grid3X3, DollarSign, Megaphone, PanelBottom,
  MessageSquare, BarChart3, HelpCircle, Users, Mail, Newspaper, Image,
  Copy, Trash2, GripVertical,
} from 'lucide-react'
import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'
import type { BlockType } from '@/blocks/types'

const blockIcons: Record<BlockType, typeof Layout> = {
  navbar: Layout,
  hero: Type,
  features: Grid3X3,
  pricing: DollarSign,
  cta: Megaphone,
  footer: PanelBottom,
  testimonials: MessageSquare,
  stats: BarChart3,
  faq: HelpCircle,
  team: Users,
  contact: Mail,
  newsletter: Newspaper,
  logocloud: Image,
}

const blockLabels: Record<BlockType, string> = {
  navbar: 'Navbar',
  hero: 'Hero',
  features: 'Features',
  pricing: 'Pricing',
  cta: 'CTA',
  footer: 'Footer',
  testimonials: 'Testimonials',
  stats: 'Stats',
  faq: 'FAQ',
  team: 'Team',
  contact: 'Contact',
  newsletter: 'Newsletter',
  logocloud: 'Logo Cloud',
}

export function LayersPanel() {
  const blocks = useConfigStore((s) => s.config.blocks)
  const { duplicateBlock, removeBlock } = useConfigStore()
  const { selectedBlockId, selectBlock } = useEditorStore()

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-2.5 pb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-3">
          Layers
        </span>
        <span className="text-[10px] text-text-3">{blocks.length}</span>
      </div>

      {/* Block list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {blocks.map((block) => {
          const Icon = blockIcons[block.type] || Layout
          const isSelected = selectedBlockId === block.id
          return (
            <div
              key={block.id}
              onClick={() => selectBlock(block.id)}
              className={`group px-2.5 py-2 rounded-md text-[12.5px] flex items-center gap-2 transition-all cursor-pointer select-none relative ${
                isSelected
                  ? 'bg-green-glow text-green'
                  : 'text-text-1 hover:bg-bg-3 hover:text-text-0'
              }`}
            >
              {/* Drag handle */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-text-3 cursor-grab">
                <GripVertical size={12} />
              </div>

              {/* Icon */}
              <div
                className={`w-[26px] h-[26px] rounded flex items-center justify-center text-[11px] shrink-0 border ${
                  isSelected
                    ? 'border-green/30 bg-green-glow'
                    : 'border-border-default bg-bg-3'
                }`}
              >
                <Icon size={13} />
              </div>

              {/* Name */}
              <span className="font-medium flex-1">{blockLabels[block.type]}</span>

              {/* Actions */}
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    duplicateBlock(block.id)
                  }}
                  className="w-[22px] h-[22px] rounded flex items-center justify-center text-text-3 hover:bg-bg-4 hover:text-text-0 transition-all"
                >
                  <Copy size={11} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeBlock(block.id)
                  }}
                  className="w-[22px] h-[22px] rounded flex items-center justify-center text-text-3 hover:bg-status-red/10 hover:text-status-red transition-all"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
