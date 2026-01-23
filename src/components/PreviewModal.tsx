// src/components/PreviewModal.tsx
import { diffLines } from 'diff'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  original: string
  modified: string
  title: string
  onAccept: () => void
}

export function PreviewModal({
  isOpen,
  onClose,
  original,
  modified,
  title,
  onAccept,
}: PreviewModalProps) {
  const diff = diffLines(original, modified)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Original</h3>
            <pre className="text-xs bg-gray-50 p-4 rounded border overflow-auto max-h-96">
              {diff.map((part, index) => (
                <span
                  key={index}
                  className={
                    part.removed
                      ? 'bg-red-100 text-red-800'
                      : part.added
                      ? ''
                      : ''
                  }
                >
                  {part.removed ? part.value : !part.added ? part.value : ''}
                </span>
              ))}
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Modified</h3>
            <pre className="text-xs bg-gray-50 p-4 rounded border overflow-auto max-h-96">
              {diff.map((part, index) => (
                <span
                  key={index}
                  className={
                    part.added
                      ? 'bg-green-100 text-green-800'
                      : part.removed
                      ? ''
                      : ''
                  }
                >
                  {part.added ? part.value : !part.removed ? part.value : ''}
                </span>
              ))}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onAccept}>
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
