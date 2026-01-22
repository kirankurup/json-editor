// src/components/Toolbar.tsx
import { Wrench, Undo } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ToolbarProps {
  onAutoRepair: () => void
  onUndo: () => void
  canUndo: boolean
  hasError: boolean
}

export function Toolbar({ onAutoRepair, onUndo, canUndo, hasError }: ToolbarProps) {
  return (
    <div className="border-b bg-white px-4 py-2 flex items-center gap-2">
      <Button
        onClick={onAutoRepair}
        variant="outline"
        size="sm"
        disabled={!hasError}
      >
        <Wrench className="w-4 h-4 mr-2" />
        Auto-Repair
      </Button>

      <Button
        onClick={onUndo}
        variant="outline"
        size="sm"
        disabled={!canUndo}
      >
        <Undo className="w-4 h-4 mr-2" />
        Undo
      </Button>

      {/* Will add Case Conversion and Search in next tasks */}
    </div>
  )
}
