// src/App.tsx
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Header } from '@/components/Header'
import { Toolbar } from '@/components/Toolbar'
import { TextEditor } from '@/components/TextEditor'
import { TreeView } from '@/components/TreeView'
import { ErrorBanner } from '@/components/ErrorBanner'
import { useJsonEditor } from '@/hooks/useJsonEditor'
import { useTreeState } from '@/hooks/useTreeState'
import { useSearch } from '@/hooks/useSearch'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { useAutoRepair } from '@/hooks/useAutoRepair'
import { useCaseConversion } from '@/hooks/useCaseConversion'
import { PreviewModal } from '@/components/PreviewModal'
import { CaseConversionDialog } from '@/components/CaseConversionDialog'
import { flattenJSON } from '@/utils/treeFlattener'
import type { CaseDirection, CaseDepth } from '@/types'
import './App.css'

function App() {
  const [showErrorBanner, setShowErrorBanner] = useState(true)
  const { toast } = useToast()
  const treeViewRef = useRef<HTMLDivElement>(null)

  const {
    jsonText,
    setJsonText,
    parsedJson,
    parseError,
    applyMutation,
    undo,
    canUndo,
  } = useJsonEditor()

  // Create base nodes for search (without expansion state)
  const baseNodes = useMemo(() => {
    if (!parsedJson) return []
    return flattenJSON(parsedJson, new Set())
  }, [parsedJson])

  // Initialize search
  const { searchState, currentMatchId, search, next, previous, clear } = useSearch(baseNodes)

  // Use tree state with search
  const {
    nodes,
    toggleExpanded,
    toggleValueExpanded,
  } = useTreeState(parsedJson, searchState)

  // Auto-scroll to current match
  useEffect(() => {
    if (currentMatchId && treeViewRef.current) {
      // Find the element with the current match
      const matchElement = treeViewRef.current.querySelector(`[data-node-id="${currentMatchId}"]`)
      if (matchElement) {
        matchElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentMatchId])

  const autoRepair = useAutoRepair()
  const caseConversion = useCaseConversion()

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
    if (!parseError) return
    try {
      autoRepair.startRepair(jsonText)
    } catch (error) {
      toast({
        title: 'Auto-repair failed',
        description: 'Could not repair this JSON',
        variant: 'destructive',
      })
    }
  }, [jsonText, parseError, autoRepair, toast])

  const handleAcceptRepair = useCallback(() => {
    applyMutation(autoRepair.repaired)
    autoRepair.close()
    setShowErrorBanner(true) // Re-show banner if new errors
  }, [applyMutation, autoRepair])

  const handleCaseConversion = useCallback(() => {
    if (!parsedJson) return
    caseConversion.startConversion()
  }, [parsedJson, caseConversion])

  const handleConvert = useCallback((direction: CaseDirection, depth: CaseDepth) => {
    caseConversion.convert(jsonText, parsedJson, direction, depth)
  }, [jsonText, parsedJson, caseConversion])

  const handleAcceptConversion = useCallback(() => {
    applyMutation(caseConversion.converted)
    caseConversion.closePreview()
  }, [applyMutation, caseConversion])

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
        onCaseConversion={handleCaseConversion}
        canUndo={canUndo}
        hasError={!!parseError}
        hasValidJson={!!parsedJson}
        onSearch={search}
        onSearchNext={next}
        onSearchPrevious={previous}
        onSearchClear={clear}
        searchMatchCount={searchState.matchingNodeIds.length}
        searchCurrentIndex={searchState.currentMatchIndex}
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
          <div ref={treeViewRef} className="h-full">
            <TreeView
              nodes={nodes}
              onToggleExpanded={toggleExpanded}
              onToggleValueExpanded={toggleValueExpanded}
              onCopyPath={handleCopyPath}
              emptyMessage={emptyMessage}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {parseError && showErrorBanner && (
        <ErrorBanner
          error={parseError}
          onAutoRepair={handleAutoRepair}
          onDismiss={() => setShowErrorBanner(false)}
        />
      )}

      <PreviewModal
        isOpen={autoRepair.isOpen}
        onClose={autoRepair.close}
        original={autoRepair.original}
        modified={autoRepair.repaired}
        title="Auto-Repair Preview"
        onAccept={handleAcceptRepair}
      />

      <CaseConversionDialog
        isOpen={caseConversion.isDialogOpen}
        onClose={caseConversion.closeDialog}
        onConvert={handleConvert}
      />

      <PreviewModal
        isOpen={caseConversion.isPreviewOpen}
        onClose={caseConversion.closePreview}
        original={caseConversion.original}
        modified={caseConversion.converted}
        title="Case Conversion Preview"
        onAccept={handleAcceptConversion}
      />

      <Toaster />
    </div>
  )
}

export default App
