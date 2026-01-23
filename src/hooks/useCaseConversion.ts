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
    parsedJson: any,
    direction: CaseDirection,
    depth: CaseDepth
  ) => {
    const convertedObj = convertCaseUtil(parsedJson, direction, depth)
    const convertedText = JSON.stringify(convertedObj, null, 2)

    setOriginal(jsonText)
    setConverted(convertedText)
    setIsDialogOpen(false)
    setIsPreviewOpen(true)
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
