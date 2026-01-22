import { useEffect, useRef } from 'react'
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
          },
          '.cm-scroller': {
            overflow: 'auto',
            fontFamily: 'ui-monospace, monospace',
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
  }, []) // Only create once

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
      className="h-full w-full overflow-hidden border-r"
      data-testid="text-editor"
    />
  )
}
