import { useState, useCallback, useEffect } from 'react'
import type { ParseError, UndoEntry, JSONValue } from '@/types'

const MAX_UNDO_STACK = 20

export function useJsonEditor() {
  const [jsonText, setJsonTextInternal] = useState('')
  const [parsedJson, setParsedJson] = useState<JSONValue | null>(null)
  const [parseError, setParseError] = useState<ParseError | null>(null)
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([])

  // Parse JSON whenever text changes
  useEffect(() => {
    if (!jsonText.trim()) {
      setParsedJson(null)
      setParseError(null)
      return
    }

    try {
      const parsed = JSON.parse(jsonText)
      setParsedJson(parsed)
      setParseError(null)
    } catch (error) {
      setParsedJson(null)

      if (error instanceof SyntaxError) {
        // Extract line and column if possible
        const match = error.message.match(/position (\d+)/)
        const position = match ? parseInt(match[1], 10) : undefined

        let line: number | undefined
        let column: number | undefined

        if (position !== undefined) {
          const lines = jsonText.substring(0, position).split('\n')
          line = lines.length
          column = lines[lines.length - 1].length + 1
        }

        setParseError({
          message: error.message,
          line,
          column,
        })
      } else {
        setParseError({
          message: 'Unknown parse error',
        })
      }
    }
  }, [jsonText])

  const setJsonText = useCallback((text: string) => {
    setJsonTextInternal(text)
  }, [])

  const applyMutation = useCallback((newText: string) => {
    setJsonTextInternal(currentText => {
      setUndoStack(prev => {
        const newStack = [...prev, { text: currentText, timestamp: Date.now() }]
        // Keep only last MAX_UNDO_STACK items
        return newStack.slice(-MAX_UNDO_STACK)
      })
      return newText
    })
  }, [])

  const undo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev

      const lastEntry = prev[prev.length - 1]
      setJsonTextInternal(lastEntry.text)
      return prev.slice(0, -1)
    })
  }, [])

  const canUndo = undoStack.length > 0

  return {
    jsonText,
    setJsonText,
    parsedJson,
    parseError,
    applyMutation,
    undo,
    canUndo,
  }
}
