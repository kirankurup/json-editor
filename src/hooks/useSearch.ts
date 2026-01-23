// src/hooks/useSearch.ts
import { useState, useCallback } from 'react'
import type { TreeNode, SearchState } from '@/types'

export function useSearch(nodes: TreeNode[]) {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    matchingNodeIds: [],
    currentMatchIndex: -1,
  })

  const search = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchState({
        query: '',
        matchingNodeIds: [],
        currentMatchIndex: -1,
      })
      return
    }

    const lowerQuery = query.toLowerCase()
    const matching = nodes
      .filter(node => {
        const keyMatch = node.key.toLowerCase().includes(lowerQuery)
        const valueMatch = typeof node.value === 'string'
          ? node.value.toLowerCase().includes(lowerQuery)
          : String(node.value).toLowerCase().includes(lowerQuery)
        return keyMatch || valueMatch
      })
      .map(node => node.id)

    setSearchState({
      query,
      matchingNodeIds: matching,
      currentMatchIndex: matching.length > 0 ? 0 : -1,
    })
  }, [nodes])

  const next = useCallback(() => {
    setSearchState(prev => {
      if (prev.matchingNodeIds.length === 0) return prev
      const nextIndex = (prev.currentMatchIndex + 1) % prev.matchingNodeIds.length
      return { ...prev, currentMatchIndex: nextIndex }
    })
  }, [])

  const previous = useCallback(() => {
    setSearchState(prev => {
      if (prev.matchingNodeIds.length === 0) return prev
      const prevIndex = prev.currentMatchIndex - 1 < 0
        ? prev.matchingNodeIds.length - 1
        : prev.currentMatchIndex - 1
      return { ...prev, currentMatchIndex: prevIndex }
    })
  }, [])

  const clear = useCallback(() => {
    setSearchState({
      query: '',
      matchingNodeIds: [],
      currentMatchIndex: -1,
    })
  }, [])

  const currentMatchId = searchState.currentMatchIndex >= 0
    ? searchState.matchingNodeIds[searchState.currentMatchIndex]
    : null

  return {
    searchState,
    currentMatchId,
    search,
    next,
    previous,
    clear,
  }
}
