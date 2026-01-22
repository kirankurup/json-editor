// src/components/ErrorBanner.tsx
import { AlertCircle, X, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ParseError } from '@/types'

interface ErrorBannerProps {
  error: ParseError
  onAutoRepair: () => void
  onDismiss: () => void
}

export function ErrorBanner({ error, onAutoRepair, onDismiss }: ErrorBannerProps) {
  const errorMessage = error.line && error.column
    ? `${error.message} (line ${error.line}, column ${error.column})`
    : error.message

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-50 border-t border-red-200 px-4 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-900">Invalid JSON</p>
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={onAutoRepair} variant="outline" size="sm">
          <Wrench className="w-4 h-4 mr-2" />
          Auto-Repair
        </Button>
        <Button onClick={onDismiss} variant="ghost" size="sm">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
