// src/hooks/useAutoRepair.ts
import { useState, useCallback } from 'react'
import { jsonrepair } from 'jsonrepair'

export function useAutoRepair() {
  const [isOpen, setIsOpen] = useState(false)
  const [original, setOriginal] = useState('')
  const [repaired, setRepaired] = useState('')

  const startRepair = useCallback((jsonText: string) => {
    try {
      const repairedText = jsonrepair(jsonText)
      setOriginal(jsonText)
      setRepaired(repairedText)
      setIsOpen(true)
    } catch (error) {
      console.error('Auto-repair failed:', error)
      throw error
    }
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    isOpen,
    original,
    repaired,
    startRepair,
    close,
  }
}
