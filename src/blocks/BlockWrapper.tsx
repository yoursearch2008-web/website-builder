import type { ReactNode } from 'react'
import type { BlockConfig } from './types'

interface Props {
  block: BlockConfig
  isSelected: boolean
  onSelect: () => void
  children: ReactNode
}

export function BlockWrapper({ block, isSelected, onSelect, children }: Props) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      className={`relative cursor-pointer transition-all border-b border-border-subtle group ${
        isSelected
          ? 'bg-green-glow2 outline outline-2 outline-green -outline-offset-2 rounded'
          : 'hover:bg-green-glow2'
      }`}
    >
      {/* Block type tag */}
      <span
        className={`absolute top-1.5 left-1.5 text-[9px] font-semibold uppercase tracking-wider text-green bg-green-glow px-1.5 py-0.5 rounded transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        {block.type}
      </span>

      {children}
    </div>
  )
}
