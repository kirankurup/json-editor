import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import type { TreeNode as TreeNodeType } from '@/types'
import { TreeNode } from './TreeNode'

interface TreeViewProps {
  nodes: TreeNodeType[]
  onToggleExpanded: (nodeId: string) => void
  onToggleValueExpanded: (nodeId: string) => void
  onCopyPath: (path: string) => void
  emptyMessage?: string
}

export function TreeView({
  nodes,
  onToggleExpanded,
  onToggleValueExpanded,
  onCopyPath,
  emptyMessage = 'Paste JSON or upload a file to get started',
}: TreeViewProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: nodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32, // Estimated row height
    overscan: 10,
  })

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div ref={parentRef} className="h-full overflow-auto" role="tree">
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
