// src/hooks/useAutoRepair.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoRepair } from './useAutoRepair'

describe('useAutoRepair', () => {
  it('should initialize with closed state', () => {
    const { result } = renderHook(() => useAutoRepair())

    expect(result.current.isOpen).toBe(false)
    expect(result.current.original).toBe('')
    expect(result.current.repaired).toBe('')
  })

  it('should repair malformed JSON and open modal', () => {
    const { result } = renderHook(() => useAutoRepair())

    const malformedJSON = '{ "name": "John", }'

    act(() => {
      result.current.startRepair(malformedJSON)
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.original).toBe(malformedJSON)
    expect(result.current.repaired).toBe('{ "name": "John" }')
  })

  it('should close modal', () => {
    const { result } = renderHook(() => useAutoRepair())

    act(() => {
      result.current.startRepair('{ "name": "John", }')
    })

    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.close()
    })

    expect(result.current.isOpen).toBe(false)
  })

  it('should throw error for unrepairable JSON', () => {
    const { result } = renderHook(() => useAutoRepair())

    expect(() => {
      act(() => {
        // This is valid JSON, so jsonrepair might not throw
        // Let's test with something that might cause an issue
        result.current.startRepair('')
      })
    }).toThrow()
  })

  it('should handle trailing commas', () => {
    const { result } = renderHook(() => useAutoRepair())

    const malformedJSON = `{
      "users": [
        { "id": 1, "name": "Alice", },
        { "id": 2, "name": "Bob", },
      ],
    }`

    act(() => {
      result.current.startRepair(malformedJSON)
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.repaired).toBeTruthy()
    // Verify it's valid JSON
    expect(() => JSON.parse(result.current.repaired)).not.toThrow()
  })

  it('should handle missing quotes', () => {
    const { result } = renderHook(() => useAutoRepair())

    const malformedJSON = '{ name: "John" }'

    act(() => {
      result.current.startRepair(malformedJSON)
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.repaired).toBe('{ "name": "John" }')
  })
})
