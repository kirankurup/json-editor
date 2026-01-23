import { useState, useCallback, useMemo } from 'react'
import { flattenJSON } from '@/utils/treeFlattener'
import type { SearchState } from '@/types'

export function useTreeState(parsedJson: any, searchState?: SearchState) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [expandedValues, setExpandedValues] = useState<Set<string>>(new Set())

  const toggleExpanded = useCallback((nodeId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }, [])

  const toggleValueExpanded = useCallback((nodeId: string) => {
    setExpandedValues(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }, [])

  const nodes = useMemo(() => {
    if (!parsedJson) return []

    // Convert searchState to format expected by flattenJSON
    const searchData = searchState ? {
      query: searchState.query,
      matchingNodeIds: new Set(searchState.matchingNodeIds),
      currentMatchId: searchState.currentMatchIndex >= 0
        ? searchState.matchingNodeIds[searchState.currentMatchIndex]
        : null,
    } : undefined

    const flattened = flattenJSON(parsedJson, expandedIds, searchData)
    return flattened.map(node => ({
      ...node,
      isValueExpanded: expandedValues.has(node.id)
    }))
  }, [parsedJson, expandedIds, expandedValues, searchState])

  return {
    nodes,
    toggleExpanded,
    toggleValueExpanded,
  }
}
