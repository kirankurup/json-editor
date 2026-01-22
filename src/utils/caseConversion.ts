import type { CaseDirection, CaseDepth } from '@/types'

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

function convertKey(key: string, direction: CaseDirection): string {
  return direction === 'snake_to_camel' ? snakeToCamel(key) : camelToSnake(key)
}

export function convertCase(
  obj: any,
  direction: CaseDirection,
  depth: CaseDepth,
  currentDepth = 0
): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    if (depth === 'shallow' && currentDepth > 0) {
      return obj
    }
    return obj.map(item => convertCase(item, direction, depth, currentDepth))
  }

  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = currentDepth === 0 || depth === 'deep'
      ? convertKey(key, direction)
      : key

    if (depth === 'shallow' && currentDepth >= 1) {
      result[newKey] = value
    } else {
      result[newKey] = convertCase(value, direction, depth, currentDepth + 1)
    }
  }

  return result
}
