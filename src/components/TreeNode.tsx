import { memo, useRef, useEffect, useState } from 'react'
import type { TreeNode as TreeNodeType } from '@/types'
import { generateJSONPath } from '@/utils/jsonPath'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TreeNodeProps {
  node: TreeNodeType
  onToggleExpanded: (nodeId: string) => void
  onToggleValueExpanded: (nodeId: string) => void
  onCopyPath: (path: string) => void
}

export const TreeNode = memo(function TreeNode({
  node,
  onToggleExpanded,
  onToggleValueExpanded,
  onCopyPath,
}: TreeNodeProps) {
  const { id, depth, key, value, type, path, isExpanded, isTruncated, isValueExpanded, isHighlighted, isCurrentMatch } = node
  const rowRef = useRef<HTMLDivElement>(null)
  const keyRef = useRef<HTMLSpanElement>(null)
  const [maxChars, setMaxChars] = useState(50)

  // Calculate dynamic truncation based on available width
  useEffect(() => {
    if (!isTruncated || isValueExpanded) return

    const calculateMaxChars = () => {
      if (!rowRef.current || !keyRef.current) return

      // Get the full row width
      const rowWidth = rowRef.current.offsetWidth

      // Get the key width
      const keyWidth = keyRef.current.offsetWidth

      // Calculate space taken by indentation, gaps, and buttons
      const indentWidth = depth * 20 + 8
      const treeButtonWidth = 20 // Width of tree expand/collapse button + gap
      const buttonWidth = 40 // Width of value expand button with margin
      const ellipsisWidth = 20 // Approximate width for "..."
      const gapWidth = 16 // Total gap spacing (gap-2 = 8px * 2)

      // Available width for the value text
      const availableWidth = rowWidth - indentWidth - treeButtonWidth - keyWidth - buttonWidth - ellipsisWidth - gapWidth

      // Monospace font: approximate 7.2px per character for text-sm (14px)
      const charWidth = 7.2
      const calculatedMaxChars = Math.floor(availableWidth / charWidth)

      // Set minimum and maximum bounds
      const newMaxChars = Math.max(10, Math.min(calculatedMaxChars, 500))
      setMaxChars(newMaxChars)
    }

    // Calculate on mount and resize
    calculateMaxChars()

    const resizeObserver = new ResizeObserver(calculateMaxChars)
    if (rowRef.current) {
      resizeObserver.observe(rowRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [isTruncated, isValueExpanded, depth, key])

  const handleKeyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const jsonPath = generateJSONPath(path)
    onCopyPath(jsonPath)
  }

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleExpanded(id)
  }

  const handleValueExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onToggleValueExpanded(id)
  }

  const renderValue = () => {
    if (type === 'object' && value !== null && typeof value === 'object') {
      const count = Object.keys(value as Record<string, unknown>).length
      return <span className="text-muted-foreground">Object {`{${count}}`}</span>
    }

    if (type === 'array' && Array.isArray(value)) {
      return <span className="text-muted-foreground">Array [{value.length}]</span>
    }

    // Primitive value
    let stringValue = JSON.stringify(value)

    // Replace newlines with escaped representation for display
    // This prevents multi-line strings from breaking the layout
    stringValue = stringValue.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')

    const displayValue = isTruncated && !isValueExpanded
      ? stringValue.substring(0, maxChars)
      : stringValue

    if (isTruncated && !isValueExpanded) {
      // Truncated inline view
      return (
        <div className="flex-1 min-w-0 font-mono text-sm whitespace-nowrap overflow-hidden flex items-center">
          <span className={cn(
            'transition-colors duration-200',
            typeof value === 'string' ? 'text-emerald-600 dark:text-emerald-400' :
            typeof value === 'number' ? 'text-blue-600 dark:text-blue-400' :
            typeof value === 'boolean' ? 'text-purple-600 dark:text-purple-400' :
            'text-slate-600 dark:text-slate-400'
          )}>
            {displayValue}
          </span>
          <span className="text-slate-400 dark:text-slate-500">...</span>
          <button
            type="button"
            onClick={handleValueExpandClick}
            className="ml-2 flex-shrink-0 inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95 transition-all duration-200"
            aria-label="Expand value"
            title="Expand value"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 5L7 9L11 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )
    }

    if (isTruncated && isValueExpanded) {
      // Expanded block view
      return (
        <div className="flex-1 min-w-0 font-mono text-sm break-all">
          <span className={cn(
            'transition-colors duration-200',
            typeof value === 'string' ? 'text-emerald-600 dark:text-emerald-400' :
            typeof value === 'number' ? 'text-blue-600 dark:text-blue-400' :
            typeof value === 'boolean' ? 'text-purple-600 dark:text-purple-400' :
            'text-slate-600 dark:text-slate-400'
          )}>
            {displayValue}
          </span>
          <button
            type="button"
            onClick={handleValueExpandClick}
            className="ml-2 inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95 transition-all duration-200"
            aria-label="Collapse value"
            title="Collapse value"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="rotate-180"
            >
              <path
                d="M3 5L7 9L11 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )
    }

    // Not truncated - simple inline display
    return (
      <span className={cn(
        'font-mono text-sm flex-1 min-w-0 break-all',
        typeof value === 'string' ? 'text-emerald-600 dark:text-emerald-400' :
        typeof value === 'number' ? 'text-blue-600 dark:text-blue-400' :
        typeof value === 'boolean' ? 'text-purple-600 dark:text-purple-400' :
        'text-slate-600 dark:text-slate-400'
      )}>
        {displayValue}
      </span>
    )
  }

  return (
    <div
      className={cn(
        'px-2 transition-all duration-150 py-1',
        'min-h-[32px]',
        isHighlighted && 'bg-yellow-50 dark:bg-yellow-500/10',
        isCurrentMatch && 'bg-yellow-100 dark:bg-yellow-500/20'
      )}
      style={{ paddingLeft: `${depth * 20 + 8}px` }}
      data-node-id={id}
    >
      <div ref={rowRef} className="flex items-center gap-2">
        {type !== 'primitive' && (
          <button
            onClick={handleExpandClick}
            className="flex-shrink-0 text-slate-600 dark:text-slate-400"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        {type === 'primitive' && <div className="w-4 flex-shrink-0" />}

        <span
          ref={keyRef}
          onClick={handleKeyClick}
          className="text-indigo-600 dark:text-indigo-400 font-semibold flex-shrink-0 cursor-pointer hover:underline"
        >
          {key}:
        </span>
        {renderValue()}
      </div>
    </div>
  )
})
