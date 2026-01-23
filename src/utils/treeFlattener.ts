import type { TreeNode, NodeType, JSONValue } from '@/types'

// Minimum length to consider for truncation - actual truncation is dynamic based on width
const MIN_TRUNCATE_LENGTH = 50

function getNodeType(value: JSONValue): NodeType {
  if (value === null || typeof value !== 'object') return 'primitive'
  if (Array.isArray(value)) return 'array'
  return 'object'
}

function generateNodeId(path: (string | number)[]): string {
  return path.join('.')
}

export function flattenJSON(
  json: JSONValue,
  expandedIds?: Set<string>,
  searchState?: { query: string; matchingNodeIds: Set<string>; currentMatchId: string | null }
): TreeNode[] {
  const nodes: TreeNode[] = []
  const autoExpandAll = expandedIds === undefined
  const ids = expandedIds ?? new Set<string>()

  function traverse(
    value: JSONValue,
    key: string,
    path: (string | number)[],
    depth: number
  ): void {
    const nodeId = generateNodeId(path)
    const type = getNodeType(value)
    const isExpanded = autoExpandAll || ids.has(nodeId)

    // Check if the JSON stringified value might need truncation
    // Actual truncation point is calculated dynamically in the component based on available width
    let isTruncated = false
    if (type === 'primitive') {
      let stringValue = JSON.stringify(value)
      // Replace newlines for display purposes in length calculation
      stringValue = stringValue.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
      isTruncated = stringValue.length > MIN_TRUNCATE_LENGTH
    }

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
    if (type === 'object' && isExpanded && value !== null && typeof value === 'object') {
      for (const [childKey, childValue] of Object.entries(value as Record<string, JSONValue>)) {
        traverse(childValue, childKey, [...path, childKey], depth + 1)
      }
    } else if (type === 'array' && isExpanded) {
      (value as JSONValue[]).forEach((item: JSONValue, index: number) => {
        traverse(item, String(index), [...path, index], depth + 1)
      })
    }
  }

  if (json !== null && json !== undefined) {
    // Start with root object/array
    if (typeof json === 'object') {
      const isArray = Array.isArray(json)
      const rootId = ''

      // Auto-expand root by default
      if (!ids.has(rootId)) {
        ids.add(rootId)
      }

      if (isArray) {
        (json as JSONValue[]).forEach((item: JSONValue, index: number) => {
          traverse(item, String(index), [index], 0)
        })
      } else {
        for (const [key, value] of Object.entries(json)) {
          traverse(value, key, [key], 0)
        }
      }
    } else {
      // Primitive root value
      let stringValue = JSON.stringify(json)
      stringValue = stringValue.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
      const isTruncated = stringValue.length > MIN_TRUNCATE_LENGTH

      nodes.push({
        id: 'root',
        depth: 0,
        key: '',
        value: json,
        type: 'primitive',
        path: [],
        isExpanded: false,
        isTruncated,
        isValueExpanded: false,
        isHighlighted: false,
        isCurrentMatch: false,
      })
    }
  }

  return nodes
}
