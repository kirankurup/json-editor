// src/hooks/useCaseConversion.ts
import { useState, useCallback } from 'react'
import { convertCase as convertCaseUtil } from '@/utils/caseConversion'
import type { CaseDirection, CaseDepth } from '@/types'

export function useCaseConversion() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [original, setOriginal] = useState('')
  const [converted, setConverted] = useState('')

  const startConversion = useCallback(() => {
    setIsDialogOpen(true)
  }, [])

  const convert = useCallback((
    jsonText: string,
    parsedJson: unknown,
    direction: CaseDirection,
    depth: CaseDepth
  ) => {
    try {
      // Validate parsedJson is an object
      if (parsedJson === null || parsedJson === undefined) {
        throw new Error('Cannot convert case: JSON is null or undefined')
      }

      if (typeof parsedJson !== 'object') {
        throw new Error('Cannot convert case: JSON must be an object or array')
      }

      const convertedObj = convertCaseUtil(parsedJson, direction, depth)
      const convertedText = JSON.stringify(convertedObj, null, 2)

      setOriginal(jsonText)
      setConverted(convertedText)
      setIsDialogOpen(false)
      setIsPreviewOpen(true)
    } catch (error) {
      // Close dialog and re-throw for App.tsx to handle with toast
      setIsDialogOpen(false)
      throw error
    }
  }, [])

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
  }, [])

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false)
  }, [])

  return {
    isDialogOpen,
    isPreviewOpen,
    original,
    converted,
    startConversion,
    convert,
    closeDialog,
    closePreview,
  }
}
