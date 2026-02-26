import { CanvasToolbar } from './CanvasToolbar'
import { LeftSidebar } from './LeftSidebar'
import { Canvas } from './Canvas'
import { RightSidebar } from './RightSidebar'

export function EditorLayout() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <CanvasToolbar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Canvas />
          </div>
        </div>
        <RightSidebar />
      </div>
    </div>
  )
}
