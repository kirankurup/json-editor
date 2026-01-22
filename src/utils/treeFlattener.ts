import type { TreeNode, NodeType } from '@/types'

const TRUNCATE_LENGTH = 100

function getNodeType(value: any): NodeType {
  if (value === null || typeof value !== 'object') return 'primitive'
  if (Array.isArray(value)) return 'array'
  return 'object'
}

function generateNodeId(path: (string | number)[]): string {
  return path.join('.')
}

export function flattenJSON(
  json: any,
  expandedIds?: Set<string>,
  searchState?: { query: string; matchingNodeIds: Set<string>; currentMatchId: string | null }
): TreeNode[] {
  const nodes: TreeNode[] = []
  const autoExpandAll = expandedIds === undefined
  const ids = expandedIds ?? new Set<string>()

  function traverse(
    value: any,
    key: string,
    path: (string | number)[],
    depth: number
  ): void {
    const nodeId = generateNodeId(path)
    const type = getNodeType(value)
    const isExpanded = autoExpandAll || ids.has(nodeId)

    const isString = typeof value === 'string'
    const isTruncated = isString && value.length > TRUNCATE_LENGTH

    const node: TreeNode = {
      id: nodeId,
      depth,
      key,
      value,
      type,
      path: [...path],
      isExpanded: type === 'primitive' ? false : isExpanded,
      isTruncated,
      isValueExpanded: false,
      isHighlighted: searchState?.matchingNodeIds.has(nodeId) ?? false,
      isCurrentMatch: searchState?.currentMatchId === nodeId,
    }

    nodes.push(node)

    // Only traverse children if node is expanded (or should be by default)
    if (type === 'object' && isExpanded) {
      for (const [childKey, childValue] of Object.entries(value)) {
        traverse(childValue, childKey, [...path, childKey], depth + 1)
      }
    } else if (type === 'array' && isExpanded) {
      value.forEach((item: any, index: number) => {
        traverse(item, String(index), [...path, index], depth + 1)
      })
    }
  }

  if (json !== null && json !== undefined) {
    // Start with root object/array
    if (typeof json === 'object') {
      const isArray = Array.isArray(json)
      const rootType: NodeType = isArray ? 'array' : 'object'
      const rootId = ''

      // Auto-expand root by default
      if (!ids.has(rootId)) {
        ids.add(rootId)
      }

      if (isArray) {
        json.forEach((item: any, index: number) => {
          traverse(item, String(index), [index], 0)
        })
      } else {
        for (const [key, value] of Object.entries(json)) {
          traverse(value, key, [key], 0)
        }
      }
    } else {
      // Primitive root value
      nodes.push({
        id: 'root',
        depth: 0,
        key: '',
        value: json,
        type: 'primitive',
        path: [],
        isExpanded: false,
        isTruncated: typeof json === 'string' && json.length > TRUNCATE_LENGTH,
        isValueExpanded: false,
        isHighlighted: false,
        isCurrentMatch: false,
      })
    }
  }

  return nodes
}
