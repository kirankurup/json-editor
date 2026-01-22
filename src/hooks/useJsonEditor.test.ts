import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useJsonEditor } from './useJsonEditor'

describe('useJsonEditor', () => {
  it('initializes with empty state', () => {
    const { result } = renderHook(() => useJsonEditor())

    expect(result.current.jsonText).toBe('')
    expect(result.current.parsedJson).toBeNull()
    expect(result.current.parseError).toBeNull()
  })

  it('parses valid JSON', () => {
    const { result } = renderHook(() => useJsonEditor())

    act(() => {
      result.current.setJsonText('{"name": "John"}')
    })

    expect(result.current.parsedJson).toEqual({ name: 'John' })
    expect(result.current.parseError).toBeNull()
  })

  it('handles invalid JSON', () => {
    const { result } = renderHook(() => useJsonEditor())

    act(() => {
      result.current.setJsonText('{ invalid }')
    })

    expect(result.current.parsedJson).toBeNull()
    expect(result.current.parseError).not.toBeNull()
    expect(result.current.parseError?.message).toBeTruthy()
  })

  it('adds to undo stack on mutation', () => {
    const { result } = renderHook(() => useJsonEditor())

    act(() => {
      result.current.setJsonText('{"name": "John"}')
    })

    act(() => {
      result.current.applyMutation('{"name": "Jane"}')
    })

    expect(result.current.jsonText).toBe('{"name": "Jane"}')
    expect(result.current.canUndo).toBe(true)
  })

  it('performs undo', () => {
    const { result } = renderHook(() => useJsonEditor())

    act(() => {
      result.current.setJsonText('{"name": "John"}')
    })

    act(() => {
      result.current.applyMutation('{"name": "Jane"}')
    })

    act(() => {
      result.current.undo()
    })

    expect(result.current.jsonText).toBe('{"name": "John"}')
    expect(result.current.canUndo).toBe(false)
  })

  it('limits undo stack to 20 items', () => {
    const { result } = renderHook(() => useJsonEditor())

    act(() => {
      result.current.setJsonText('{"count": 0}')
    })

    // Add 25 mutations
    act(() => {
      for (let i = 1; i <= 25; i++) {
        result.current.applyMutation(`{"count": ${i}}`)
      }
    })

    // Undo 20 times (max stack size)
    act(() => {
      for (let i = 0; i < 20; i++) {
        if (result.current.canUndo) {
          result.current.undo()
        }
      }
    })

    // Should get to count: 5 (25 - 20 = 5)
    expect(result.current.parsedJson).toEqual({ count: 5 })
  })
})
