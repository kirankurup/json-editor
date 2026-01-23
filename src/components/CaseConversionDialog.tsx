// src/components/CaseConversionDialog.tsx
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { CaseDirection, CaseDepth } from '@/types'

interface CaseConversionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConvert: (direction: CaseDirection, depth: CaseDepth) => void
}

export function CaseConversionDialog({
  isOpen,
  onClose,
  onConvert,
}: CaseConversionDialogProps) {
  const [direction, setDirection] = useState<CaseDirection>('snake_to_camel')
  const [depth, setDepth] = useState<CaseDepth>('deep')

  const handleConvert = () => {
    onConvert(direction, depth)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert Case</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Direction</Label>
            <RadioGroup value={direction} onValueChange={(v) => setDirection(v as CaseDirection)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="snake_to_camel" id="snake_to_camel" />
                <Label htmlFor="snake_to_camel">snake_case → camelCase</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="camel_to_snake" id="camel_to_snake" />
                <Label htmlFor="camel_to_snake">camelCase → snake_case</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Depth</Label>
            <RadioGroup value={depth} onValueChange={(v) => setDepth(v as CaseDepth)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deep" id="deep" />
                <Label htmlFor="deep">Deep (all levels)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shallow" id="shallow" />
                <Label htmlFor="shallow">Shallow (first level only)</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConvert}>
            Convert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
