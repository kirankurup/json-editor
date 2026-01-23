// src/components/SearchBar.tsx
import { useState, useEffect } from 'react'
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  onSearch: (query: string) => void
  onNext: () => void
  onPrevious: () => void
  onClear: () => void
  matchCount: number
  currentIndex: number
}

export function SearchBar({
  onSearch,
  onNext,
  onPrevious,
  onClear,
  matchCount,
  currentIndex,
}: SearchBarProps) {
  const [query, setQuery] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, onSearch])

  const handleClear = () => {
    setQuery('')
    onClear()
  }

  return (
    <div className="flex items-center gap-2 ml-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-9 w-64 h-8"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            aria-label="Clear search"
          >
            <X className="w-3 h-3 text-gray-500" />
          </button>
        )}
      </div>

      {matchCount > 0 && (
        <span className="text-sm text-gray-600 min-w-20">
          {currentIndex + 1} / {matchCount}
        </span>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onPrevious}
        disabled={matchCount === 0}
        aria-label="Previous match"
      >
        <ChevronUp className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        disabled={matchCount === 0}
        aria-label="Next match"
      >
        <ChevronDown className="w-4 h-4" />
      </Button>
    </div>
  )
}
