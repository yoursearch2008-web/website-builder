import { Plus, Wand2 } from 'lucide-react'

export function CanvasEmpty() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-10 relative z-[1]">
      <h3 className="text-lg font-semibold text-text-1">Start building</h3>
      <p className="text-[13px] text-text-3 max-w-[360px] leading-relaxed">
        Add your first component from the library, or let the agent build a page for you.
      </p>
      <div className="flex gap-2">
        <button className="px-3.5 py-1.5 rounded-md bg-green text-black text-[12.5px] font-semibold border border-green hover:bg-green-dim transition-colors flex items-center gap-1.5">
          <Plus size={14} />
          Add Block
        </button>
        <button className="px-3.5 py-1.5 rounded-md bg-bg-3 text-text-1 text-[12.5px] font-medium border border-border-default hover:bg-bg-4 transition-colors flex items-center gap-1.5">
          <Wand2 size={14} />
          Ask Agent
        </button>
      </div>
      <div className="flex items-center gap-3 w-48 text-text-3 text-[11px]">
        <div className="flex-1 h-px bg-border-default" />
        or
        <div className="flex-1 h-px bg-border-default" />
      </div>
      <p className="text-[11px] text-text-3">
        Paste a JSON config to import an existing site
      </p>
    </div>
  )
}
