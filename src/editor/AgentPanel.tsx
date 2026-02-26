import { Send } from 'lucide-react'

export function AgentPanel() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
        <div className="self-start max-w-[94%] px-3 py-2.5 rounded-xl rounded-bl-sm bg-green-glow text-text-0 text-[12.5px] leading-relaxed border border-green/10">
          Hi! I can help you build and modify your site. Try asking me to add sections, change content, or tweak styles.
        </div>
      </div>

      {/* Input */}
      <div className="p-2.5 border-t border-border-default">
        <div className="flex gap-1.5">
          <input
            type="text"
            placeholder="Ask the agent..."
            className="flex-1 px-3 py-2 rounded-lg border border-border-default bg-bg-2 text-text-0 text-[13px] outline-none focus:border-green placeholder:text-text-3"
          />
          <button className="w-9 h-9 rounded-lg bg-green flex items-center justify-center text-black shrink-0 hover:bg-green-dim transition-colors">
            <Send size={14} />
          </button>
        </div>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {['Add hero section', 'Change colors', 'Add pricing'].map((hint) => (
            <span
              key={hint}
              className="px-2 py-0.5 rounded-full text-[10.5px] text-text-2 border border-border-default bg-bg-2 cursor-pointer hover:border-green hover:text-green hover:bg-green-glow transition-all"
            >
              {hint}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
