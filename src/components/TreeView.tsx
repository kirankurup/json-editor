import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef, useEffect } from 'react'
import type { TreeNode as TreeNodeType } from '@/types'
import { TreeNode } from './TreeNode'

interface TreeViewProps {
  nodes: TreeNodeType[]
  onToggleExpanded: (nodeId: string) => void
  onToggleValueExpanded: (nodeId: string) => void
  onCopyPath: (path: string) => void
  emptyMessage?: string
  currentMatchId?: string | null
}

export function TreeView({
  nodes,
  onToggleExpanded,
  onToggleValueExpanded,
  onCopyPath,
  emptyMessage = 'Paste JSON or upload a file to get started',
  currentMatchId,
}: TreeViewProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: nodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const node = nodes[index]
      // Expanded values need more height
      if (node.isTruncated && node.isValueExpanded) {
        return 100 // Estimated height for expanded value
      }
      return 32 // Default row height
    },
    overscan: 10,
  })

  // Auto-scroll to current match
  useEffect(() => {
    if (!currentMatchId) return

    // Find the index of the current match in the nodes array
    const matchIndex = nodes.findIndex(node => node.id === currentMatchId)

    if (matchIndex !== -1) {
      // Use virtualizer's scrollToIndex for smooth scrolling
      virtualizer.scrollToIndex(matchIndex, {
        align: 'center',
        behavior: 'smooth',
      })
    }
  }, [currentMatchId, nodes, virtualizer])

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground bg-background">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div ref={parentRef} className="h-full overflow-auto bg-background" role="tree">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const node = nodes[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
              role="treeitem"
            >
              <TreeNode
                node={node}
                onToggleExpanded={onToggleExpanded}
                onToggleValueExpanded={onToggleValueExpanded}
                onCopyPath={onCopyPath}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
