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
    let stringValue = JSON.stringify(value)

    // Replace newlines with escaped representation for display
    // This prevents multi-line strings from breaking the layout
    stringValue = stringValue.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')

    const displayValue = isTruncated && !isValueExpanded
      ? stringValue.substring(0, 100) + '...'
      : stringValue

    return (
      <span className="text-green-600 break-all">
        {displayValue}
        {isTruncated && (
          <button
            onClick={handleValueExpandClick}
            className="ml-2 text-xs text-blue-600 hover:underline inline-flex items-center"
            aria-label={isValueExpanded ? 'Collapse value' : 'Expand value'}
          >
            {isValueExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        )}
      </span>
    )
  }

  return (
    <div
      className={cn(
        'flex items-start gap-2 py-1 px-2 hover:bg-gray-100 cursor-pointer transition-colors min-h-[28px]',
        isHighlighted && 'bg-yellow-100',
        isCurrentMatch && 'bg-yellow-200'
      )}
      style={{ paddingLeft: `${depth * 20 + 8}px` }}
      onClick={handleRowClick}
      data-node-id={id}
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
      {type === 'primitive' && <div className="w-4 flex-shrink-0" />}

      <span className="text-blue-600 font-medium flex-shrink-0">{key}:</span>
      <div className="flex-1 min-w-0">
        {renderValue()}
      </div>
    </div>
  )
})
