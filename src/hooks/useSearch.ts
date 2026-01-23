// src/hooks/useSearch.ts
import { useState, useCallback } from 'react'
import type { SearchState, JSONValue } from '@/types'

// Helper function to generate node ID from path (matches treeFlattener)
function generateNodeId(path: (string | number)[]): string {
  return path.join('.')
}

// Search through entire JSON structure, not just visible nodes
function searchJSON(
  obj: JSONValue,
  query: string,
  path: (string | number)[] = []
): string[] {
  const matches: string[] = []
  const lowerQuery = query.toLowerCase()

  function traverse(value: JSONValue, currentPath: (string | number)[]) {
    const nodeId = generateNodeId(currentPath)

    // Get the key (last segment of path)
    const key = currentPath.length > 0 ? String(currentPath[currentPath.length - 1]) : ''

    // Check if key matches
    if (key && key.toLowerCase().includes(lowerQuery)) {
      matches.push(nodeId)
    }

    // Check if value matches (for primitives)
    if (value !== null && typeof value !== 'object') {
      const valueStr = String(value).toLowerCase()
      if (valueStr.includes(lowerQuery) && !matches.includes(nodeId)) {
        matches.push(nodeId)
      }
    }

    // Recurse for objects and arrays
    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          traverse(item, [...currentPath, index])
        })
      } else {
        Object.entries(value).forEach(([k, v]) => {
          traverse(v, [...currentPath, k])
        })
      }
    }
  }

  traverse(obj, path)
  return matches
}

export function useSearch(parsedJson: JSONValue | null) {
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

    // Search through entire JSON structure
    const matching = parsedJson ? searchJSON(parsedJson, query) : []

    setSearchState({
      query,
      matchingNodeIds: matching,
      currentMatchIndex: matching.length > 0 ? 0 : -1,
    })
  }, [parsedJson])

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
