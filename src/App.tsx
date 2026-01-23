// src/App.tsx
import { useState, useCallback, useEffect } from 'react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Header } from '@/components/Header'
import { Toolbar } from '@/components/Toolbar'
import { TextEditor } from '@/components/TextEditor'
import { TreeView } from '@/components/TreeView'
import { ErrorBanner } from '@/components/ErrorBanner'
import { useJsonEditor } from '@/hooks/useJsonEditor'
import { useTreeState } from '@/hooks/useTreeState'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import './App.css'

function App() {
  const [showErrorBanner, setShowErrorBanner] = useState(true)
  const { toast } = useToast()

  const {
    jsonText,
    setJsonText,
    parsedJson,
    parseError,
    undo,
    canUndo,
  } = useJsonEditor()

  const {
    nodes,
    toggleExpanded,
    toggleValueExpanded,
  } = useTreeState(parsedJson)

  // Reset error banner visibility when parseError changes
  useEffect(() => {
    if (parseError) {
      setShowErrorBanner(true)
    }
  }, [parseError])

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const content = e.target?.result as string

      // Check file size
      const sizeInMB = file.size / (1024 * 1024)
      if (sizeInMB > 10) {
        toast({
          title: 'Large file detected',
          description: `${sizeInMB.toFixed(2)} MB. This may take a moment to parse.`,
        })
      }

      setJsonText(content)
    }

    reader.onerror = () => {
      toast({
        title: 'File read error',
        description: 'Failed to read the file. Please try again.',
        variant: 'destructive',
      })
    }

    reader.readAsText(file)
  }, [setJsonText, toast])

  const handleAutoRepair = useCallback(() => {
    // Will implement with PreviewModal in next task
    toast({
      title: 'Auto-repair',
      description: 'Coming soon - will show preview modal',
    })
  }, [toast])

  const handleCopyPath = useCallback((path: string) => {
    navigator.clipboard.writeText(path)
      .then(() => {
        toast({
          title: 'Path copied!',
          description: path,
          duration: 2000,
        })
      })
      .catch(() => {
        toast({
          title: 'Copy failed',
          description: 'Unable to copy to clipboard',
          variant: 'destructive',
        })
      })
  }, [toast])

  const emptyMessage = parseError
    ? 'Invalid JSON - see errors below'
    : 'Paste JSON or upload a file to get started'

  return (
    <div className="h-screen flex flex-col">
      <Header onFileUpload={handleFileUpload} />
      <Toolbar
        onAutoRepair={handleAutoRepair}
        onUndo={undo}
        canUndo={canUndo}
        hasError={!!parseError}
      />

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={50} minSize={30}>
          <TextEditor
            value={jsonText}
            onChange={setJsonText}
            parseError={parseError}
          />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={50} minSize={30}>
          <TreeView
            nodes={nodes}
            onToggleExpanded={toggleExpanded}
            onToggleValueExpanded={toggleValueExpanded}
            onCopyPath={handleCopyPath}
            emptyMessage={emptyMessage}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      {parseError && showErrorBanner && (
        <ErrorBanner
          error={parseError}
          onAutoRepair={handleAutoRepair}
          onDismiss={() => setShowErrorBanner(false)}
        />
      )}

      <Toaster />
    </div>
  )
}

export default App
