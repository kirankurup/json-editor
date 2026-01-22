import { memo } from 'react'
import type { TreeNode as TreeNodeType } from '@/types'
import { generateJSONPath } from '@/utils/jsonPath'
import { ChevronRight, ChevronDown, Maximize2, Minimize2 } from 'lucide-react'
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

  const handleRowClick = () => {
    const jsonPath = generateJSONPath(path)
    onCopyPath(jsonPath)
  }

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleExpanded(id)
  }

  const handleValueExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleValueExpanded(id)
  }

  const renderValue = () => {
    if (type === 'object') {
      const count = Object.keys(value).length
      return <span className="text-muted-foreground">Object {`{${count}}`}</span>
    }

    if (type === 'array') {
      return <span className="text-muted-foreground">Array [{value.length}]</span>
    }

    // Primitive value
    const stringValue = JSON.stringify(value)
    const displayValue = isTruncated && !isValueExpanded
      ? stringValue.substring(0, 100) + '...'
      : stringValue

    return (
      <span className="text-green-600">
        {displayValue}
        {isTruncated && (
          <button
            onClick={handleValueExpandClick}
            className="ml-2 text-xs text-blue-600 hover:underline"
          >
            {isValueExpanded ? <Minimize2 className="inline w-3 h-3" /> : <Maximize2 className="inline w-3 h-3" />}
          </button>
        )}
      </span>
    )
  }

  return (
    <div
      className={cn(
        'flex items-start gap-2 py-1 px-2 hover:bg-gray-100 cursor-pointer transition-colors',
        isHighlighted && 'bg-yellow-100',
        isCurrentMatch && 'bg-yellow-200'
      )}
      style={{ paddingLeft: `${depth * 20 + 8}px` }}
      onClick={handleRowClick}
    >
      {type !== 'primitive' && (
        <button
          onClick={handleExpandClick}
          className="flex-shrink-0 mt-1"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      )}
      {type === 'primitive' && <div className="w-4" />}

      <span className="text-blue-600 font-medium">{key}:</span>
      {renderValue()}
    </div>
  )
})
