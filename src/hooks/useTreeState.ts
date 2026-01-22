import { useState, useCallback, useMemo } from 'react'
import { flattenJSON } from '@/utils/treeFlattener'

export function useTreeState(parsedJson: any) {
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
    const flattened = flattenJSON(parsedJson, expandedIds)
    // Apply value expansion state
    return flattened.map(node => ({
      ...node,
      isValueExpanded: expandedValues.has(node.id)
    }))
  }, [parsedJson, expandedIds, expandedValues])

  return {
    nodes,
    toggleExpanded,
    toggleValueExpanded,
  }
}
