// src/components/Toolbar.tsx
import { Wrench, Undo, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/SearchBar'

interface ToolbarProps {
  onAutoRepair: () => void
  onUndo: () => void
  onCaseConversion: () => void
  canUndo: boolean
  hasError: boolean
  hasValidJson: boolean
  onSearch: (query: string) => void
  onSearchNext: () => void
  onSearchPrevious: () => void
  onSearchClear: () => void
  searchMatchCount: number
  searchCurrentIndex: number
}

export function Toolbar({
  onAutoRepair,
  onUndo,
  onCaseConversion,
  canUndo,
  hasError,
  hasValidJson,
  onSearch,
  onSearchNext,
  onSearchPrevious,
  onSearchClear,
  searchMatchCount,
  searchCurrentIndex,
}: ToolbarProps) {
  return (
    <div className="border-b bg-white px-4 py-2 flex items-center gap-2">
      <Button
        onClick={onAutoRepair}
        variant="outline"
        size="sm"
        disabled={!hasError}
        aria-label={hasError ? "Auto-repair JSON errors" : "No errors to repair"}
      >
        <Wrench className="w-4 h-4 mr-2" />
        Auto-Repair
      </Button>

      <Button
        onClick={onCaseConversion}
        variant="outline"
        size="sm"
        disabled={!hasValidJson}
        aria-label={hasValidJson ? "Convert case of JSON keys" : "No valid JSON to convert"}
      >
        <Type className="w-4 h-4 mr-2" />
        Convert Case
      </Button>

      <Button
        onClick={onUndo}
        variant="outline"
        size="sm"
        disabled={!canUndo}
        aria-label={canUndo ? "Undo last change" : "No changes to undo"}
      >
        <Undo className="w-4 h-4 mr-2" />
        Undo
      </Button>

      <SearchBar
        onSearch={onSearch}
        onNext={onSearchNext}
        onPrevious={onSearchPrevious}
        onClear={onSearchClear}
        matchCount={searchMatchCount}
        currentIndex={searchCurrentIndex}
      />
    </div>
  )
}
