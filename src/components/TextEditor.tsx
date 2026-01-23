import { useEffect, useRef, useState } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { json } from '@codemirror/lang-json'
import { EditorState } from '@codemirror/state'
import { lintGutter } from '@codemirror/lint'
import type { ParseError } from '@/types'

interface TextEditorProps {
  value: string
  onChange: (value: string) => void
  parseError: ParseError | null
}

export function TextEditor({ value, onChange, parseError }: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [isDark, setIsDark] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (!editorRef.current) return

    const startState = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        json(),
        lintGutter(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            color: isDark ? '#e2e8f0' : '#0f172a',
          },
          '.cm-scroller': {
            overflow: 'auto',
            fontFamily: 'ui-monospace, monospace',
          },
          '.cm-gutters': {
            backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
            color: isDark ? '#94a3b8' : '#64748b',
            border: 'none',
          },
          '.cm-activeLineGutter': {
            backgroundColor: isDark ? '#334155' : '#e2e8f0',
          },
          '.cm-activeLine': {
            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
          },
          '.cm-content': {
            caretColor: isDark ? '#60a5fa' : '#3b82f6',
          },
          '.cm-cursor': {
            borderLeftColor: isDark ? '#60a5fa' : '#3b82f6',
          },
          '.cm-selectionBackground, ::selection': {
            backgroundColor: isDark ? '#334155' : '#dbeafe',
          },
          '&.cm-focused .cm-selectionBackground, &.cm-focused ::selection': {
            backgroundColor: isDark ? '#334155' : '#bfdbfe',
          },
        }),
      ],
    })

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [isDark, onChange, value]) // Recreate when theme changes

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (!viewRef.current) return

    const currentValue = viewRef.current.state.doc.toString()
    if (currentValue !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: value,
        },
      })
    }
  }, [value])

  // TODO: Add error decorations based on parseError
  useEffect(() => {
    if (!viewRef.current || !parseError) return
    // Will implement error decorations in future iteration
  }, [parseError])

  return (
    <div
      ref={editorRef}
      className="h-full w-full overflow-hidden border-r border-border"
      data-testid="text-editor"
    />
  )
}
