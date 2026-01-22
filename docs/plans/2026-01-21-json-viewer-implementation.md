# JSON Viewer & Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a polished, browser-based JSON viewer/editor with auto-repair, case conversion, virtualized tree view, and GitHub Pages deployment.

**Architecture:** React 19.2 + TypeScript + Vite. CodeMirror 6 for text editor, @tanstack/react-virtual for tree view. State managed via custom useJsonEditor hook. Text editor is source of truth, tree view derives from parsed JSON.

**Tech Stack:** React 19.2, TypeScript, Vite, Tailwind CSS, shadcn/ui, CodeMirror 6, @tanstack/react-virtual, jsonrepair, diff library

---

## Task 1: Project Setup & Configuration

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `.env.example`

**Step 1: Initialize project with Vite**

Run: `npm create vite@latest . -- --template react-ts`
Expected: Vite React TypeScript template created

**Step 2: Update package.json with dependencies**

```json
{
  "name": "json-editor",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@codemirror/lang-json": "^6.0.1",
    "@codemirror/state": "^6.4.0",
    "@codemirror/view": "^6.23.0",
    "@tanstack/react-virtual": "^3.0.1",
    "codemirror": "^6.0.1",
    "jsonrepair": "^3.6.1",
    "diff": "^5.1.0",
    "react-resizable-panels": "^1.0.9",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-toast": "^1.1.5",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.47",
    "@types/react-dom": "^18.2.18",
    "@types/diff": "^5.0.9",
    "@typescript-eslint/eslint-plugin": "^6.18.1",
    "@typescript-eslint/parser": "^6.18.1",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11",
    "vitest": "^1.2.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.2.0",
    "@testing-library/user-event": "^14.5.2",
    "jsdom": "^23.2.0"
  }
}
```

**Step 3: Install dependencies**

Run: `npm install`
Expected: All dependencies installed successfully

**Step 4: Configure Vite for GitHub Pages**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/json-editor/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

**Step 5: Configure TypeScript**

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

```json
// tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 6: Configure Tailwind CSS**

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Step 7: Create index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JSON Viewer & Editor</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 8: Verify setup**

Run: `npm run dev`
Expected: Dev server starts on localhost:5173

**Step 9: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json tsconfig.node.json index.html tailwind.config.js postcss.config.js
git commit -m "feat: initialize project with Vite, React, TypeScript, and Tailwind"
```

---

## Task 2: Core Types & Utilities

**Files:**
- Create: `src/types/index.ts`
- Create: `src/utils/jsonPath.ts`
- Create: `src/utils/jsonPath.test.ts`
- Create: `src/utils/caseConversion.ts`
- Create: `src/utils/caseConversion.test.ts`
- Create: `src/utils/treeFlattener.ts`
- Create: `src/utils/treeFlattener.test.ts`
- Create: `src/test/setup.ts`

**Step 1: Create test setup file**

```typescript
// src/test/setup.ts
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

afterEach(() => {
  cleanup()
})
```

**Step 2: Define core types**

```typescript
// src/types/index.ts
export type NodeType = 'object' | 'array' | 'primitive'

export interface TreeNode {
  id: string
  depth: number
  key: string
  value: any
  type: NodeType
  path: string[]
  isExpanded: boolean
  isTruncated: boolean
  isValueExpanded: boolean
  isHighlighted: boolean
  isCurrentMatch: boolean
}

export interface SearchState {
  query: string
  matchingNodeIds: string[]
  currentMatchIndex: number
}

export interface UndoEntry {
  text: string
  timestamp: number
}

export interface ParseError {
  message: string
  line?: number
  column?: number
}

export type CaseDirection = 'snake_to_camel' | 'camel_to_snake'
export type CaseDepth = 'deep' | 'shallow'
```

**Step 3: Write JSONPath generation test**

```typescript
// src/utils/jsonPath.test.ts
import { describe, it, expect } from 'vitest'
import { generateJSONPath } from './jsonPath'

describe('generateJSONPath', () => {
  it('generates path for root', () => {
    expect(generateJSONPath([])).toBe('$')
  })

  it('generates path for simple property', () => {
    expect(generateJSONPath(['users'])).toBe('$.users')
  })

  it('generates path for array index', () => {
    expect(generateJSONPath(['users', 0])).toBe('$.users[0]')
  })

  it('generates path for nested property', () => {
    expect(generateJSONPath(['users', 0, 'name'])).toBe('$.users[0].name')
  })

  it('generates path for complex nested structure', () => {
    expect(generateJSONPath(['data', 'items', 2, 'address', 'city']))
      .toBe('$.data.items[2].address.city')
  })
})
```

**Step 4: Run test to verify it fails**

Run: `npm test -- jsonPath.test.ts`
Expected: FAIL - generateJSONPath not defined

**Step 5: Implement JSONPath generation**

```typescript
// src/utils/jsonPath.ts
export function generateJSONPath(path: (string | number)[]): string {
  if (path.length === 0) return '$'

  return path.reduce((acc, segment) => {
    if (typeof segment === 'number') {
      return `${acc}[${segment}]`
    }
    return `${acc}.${segment}`
  }, '$')
}
```

**Step 6: Run test to verify it passes**

Run: `npm test -- jsonPath.test.ts`
Expected: PASS - all tests pass

**Step 7: Write case conversion tests**

```typescript
// src/utils/caseConversion.test.ts
import { describe, it, expect } from 'vitest'
import { convertCase, snakeToCamel, camelToSnake } from './caseConversion'

describe('snakeToCamel', () => {
  it('converts snake_case to camelCase', () => {
    expect(snakeToCamel('user_name')).toBe('userName')
    expect(snakeToCamel('first_name_last')).toBe('firstNameLast')
  })

  it('handles already camelCase', () => {
    expect(snakeToCamel('userName')).toBe('userName')
  })
})

describe('camelToSnake', () => {
  it('converts camelCase to snake_case', () => {
    expect(camelToSnake('userName')).toBe('user_name')
    expect(camelToSnake('firstName')).toBe('first_name')
  })

  it('handles already snake_case', () => {
    expect(camelToSnake('user_name')).toBe('user_name')
  })
})

describe('convertCase', () => {
  const input = {
    user_name: 'John',
    user_age: 30,
    user_address: {
      street_name: 'Main St',
      zip_code: '12345'
    }
  }

  it('converts deep snake_to_camel', () => {
    const result = convertCase(input, 'snake_to_camel', 'deep')
    expect(result).toEqual({
      userName: 'John',
      userAge: 30,
      userAddress: {
        streetName: 'Main St',
        zipCode: '12345'
      }
    })
  })

  it('converts shallow snake_to_camel', () => {
    const result = convertCase(input, 'snake_to_camel', 'shallow')
    expect(result).toEqual({
      userName: 'John',
      userAge: 30,
      userAddress: {
        street_name: 'Main St',
        zip_code: '12345'
      }
    })
  })

  it('handles arrays', () => {
    const arrayInput = {
      user_list: [
        { user_name: 'Alice' },
        { user_name: 'Bob' }
      ]
    }
    const result = convertCase(arrayInput, 'snake_to_camel', 'deep')
    expect(result).toEqual({
      userList: [
        { userName: 'Alice' },
        { userName: 'Bob' }
      ]
    })
  })
})
```

**Step 8: Run test to verify it fails**

Run: `npm test -- caseConversion.test.ts`
Expected: FAIL - functions not defined

**Step 9: Implement case conversion**

```typescript
// src/utils/caseConversion.ts
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
```

**Step 10: Run test to verify it passes**

Run: `npm test -- caseConversion.test.ts`
Expected: PASS - all tests pass

**Step 11: Write tree flattener tests**

```typescript
// src/utils/treeFlattener.test.ts
import { describe, it, expect } from 'vitest'
import { flattenJSON } from './treeFlattener'

describe('flattenJSON', () => {
  it('flattens simple object', () => {
    const input = { name: 'John', age: 30 }
    const result = flattenJSON(input)

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      key: 'name',
      value: 'John',
      type: 'primitive',
      depth: 0,
      path: ['name']
    })
    expect(result[1]).toMatchObject({
      key: 'age',
      value: 30,
      type: 'primitive',
      depth: 0,
      path: ['age']
    })
  })

  it('flattens nested object', () => {
    const input = {
      user: {
        name: 'John',
        age: 30
      }
    }
    const result = flattenJSON(input)

    expect(result).toHaveLength(3)
    expect(result[0].key).toBe('user')
    expect(result[0].type).toBe('object')
    expect(result[0].isExpanded).toBe(true)
    expect(result[1].key).toBe('name')
    expect(result[1].depth).toBe(1)
    expect(result[2].key).toBe('age')
  })

  it('flattens array', () => {
    const input = {
      users: ['Alice', 'Bob']
    }
    const result = flattenJSON(input)

    expect(result[0].key).toBe('users')
    expect(result[0].type).toBe('array')
    expect(result[1].key).toBe('0')
    expect(result[1].value).toBe('Alice')
    expect(result[2].key).toBe('1')
    expect(result[2].value).toBe('Bob')
  })

  it('truncates long string values', () => {
    const longString = 'a'.repeat(150)
    const input = { text: longString }
    const result = flattenJSON(input)

    expect(result[0].isTruncated).toBe(true)
    expect(result[0].value).toBe(longString)
  })

  it('respects expanded state', () => {
    const input = {
      user: { name: 'John' }
    }
    const expandedIds = new Set<string>()
    const result = flattenJSON(input, expandedIds)

    // When user object is not in expandedIds, its children should not appear
    const userNode = result.find(n => n.key === 'user')
    expect(userNode?.isExpanded).toBe(false)
  })
})
```

**Step 12: Run test to verify it fails**

Run: `npm test -- treeFlattener.test.ts`
Expected: FAIL - flattenJSON not defined

**Step 13: Implement tree flattener**

```typescript
// src/utils/treeFlattener.ts
import type { TreeNode, NodeType } from '@/types'

const TRUNCATE_LENGTH = 100

function getNodeType(value: any): NodeType {
  if (value === null || typeof value !== 'object') return 'primitive'
  if (Array.isArray(value)) return 'array'
  return 'object'
}

function generateNodeId(path: (string | number)[]): string {
  return path.join('.')
}

export function flattenJSON(
  json: any,
  expandedIds: Set<string> = new Set(),
  searchState?: { query: string; matchingNodeIds: Set<string>; currentMatchId: string | null }
): TreeNode[] {
  const nodes: TreeNode[] = []

  function traverse(
    value: any,
    key: string,
    path: (string | number)[],
    depth: number
  ): void {
    const nodeId = generateNodeId(path)
    const type = getNodeType(value)
    const isExpanded = expandedIds.has(nodeId)

    const isString = typeof value === 'string'
    const isTruncated = isString && value.length > TRUNCATE_LENGTH

    const node: TreeNode = {
      id: nodeId,
      depth,
      key,
      value,
      type,
      path: [...path],
      isExpanded: type === 'primitive' ? false : isExpanded,
      isTruncated,
      isValueExpanded: false,
      isHighlighted: searchState?.matchingNodeIds.has(nodeId) ?? false,
      isCurrentMatch: searchState?.currentMatchId === nodeId,
    }

    nodes.push(node)

    // Only traverse children if node is expanded (or should be by default)
    if (type === 'object' && isExpanded) {
      for (const [childKey, childValue] of Object.entries(value)) {
        traverse(childValue, childKey, [...path, childKey], depth + 1)
      }
    } else if (type === 'array' && isExpanded) {
      value.forEach((item: any, index: number) => {
        traverse(item, String(index), [...path, index], depth + 1)
      })
    }
  }

  if (json !== null && json !== undefined) {
    // Start with root object/array
    if (typeof json === 'object') {
      const isArray = Array.isArray(json)
      const rootType: NodeType = isArray ? 'array' : 'object'
      const rootId = ''

      // Auto-expand root by default
      if (!expandedIds.has(rootId)) {
        expandedIds.add(rootId)
      }

      if (isArray) {
        json.forEach((item: any, index: number) => {
          traverse(item, String(index), [index], 0)
        })
      } else {
        for (const [key, value] of Object.entries(json)) {
          traverse(value, key, [key], 0)
        }
      }
    } else {
      // Primitive root value
      nodes.push({
        id: 'root',
        depth: 0,
        key: '',
        value: json,
        type: 'primitive',
        path: [],
        isExpanded: false,
        isTruncated: typeof json === 'string' && json.length > TRUNCATE_LENGTH,
        isValueExpanded: false,
        isHighlighted: false,
        isCurrentMatch: false,
      })
    }
  }

  return nodes
}
```

**Step 14: Run test to verify it passes**

Run: `npm test -- treeFlattener.test.ts`
Expected: PASS - all tests pass

**Step 15: Commit**

```bash
git add src/types/ src/utils/ src/test/
git commit -m "feat: add core types and utilities with tests"
```

---

## Task 3: Custom Hook - useJsonEditor

**Files:**
- Create: `src/hooks/useJsonEditor.ts`
- Create: `src/hooks/useJsonEditor.test.ts`

**Step 1: Write useJsonEditor hook tests**

```typescript
// src/hooks/useJsonEditor.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useJsonEditor } from './useJsonEditor'

describe('useJsonEditor', () => {
  it('initializes with empty state', () => {
    const { result } = renderHook(() => useJsonEditor())

    expect(result.current.jsonText).toBe('')
    expect(result.current.parsedJson).toBeNull()
    expect(result.current.parseError).toBeNull()
  })

  it('parses valid JSON', () => {
    const { result } = renderHook(() => useJsonEditor())

    act(() => {
      result.current.setJsonText('{"name": "John"}')
    })

    expect(result.current.parsedJson).toEqual({ name: 'John' })
    expect(result.current.parseError).toBeNull()
  })

  it('handles invalid JSON', () => {
    const { result } = renderHook(() => useJsonEditor())

    act(() => {
      result.current.setJsonText('{ invalid }')
    })

    expect(result.current.parsedJson).toBeNull()
    expect(result.current.parseError).not.toBeNull()
    expect(result.current.parseError?.message).toBeTruthy()
  })

  it('adds to undo stack on mutation', () => {
    const { result } = renderHook(() => useJsonEditor())

    act(() => {
      result.current.setJsonText('{"name": "John"}')
    })

    act(() => {
      result.current.applyMutation('{"name": "Jane"}')
    })

    expect(result.current.jsonText).toBe('{"name": "Jane"}')
    expect(result.current.canUndo).toBe(true)
  })

  it('performs undo', () => {
    const { result } = renderHook(() => useJsonEditor())

    act(() => {
      result.current.setJsonText('{"name": "John"}')
    })

    act(() => {
      result.current.applyMutation('{"name": "Jane"}')
    })

    act(() => {
      result.current.undo()
    })

    expect(result.current.jsonText).toBe('{"name": "John"}')
    expect(result.current.canUndo).toBe(false)
  })

  it('limits undo stack to 20 items', () => {
    const { result } = renderHook(() => useJsonEditor())

    act(() => {
      result.current.setJsonText('{"count": 0}')
    })

    // Add 25 mutations
    act(() => {
      for (let i = 1; i <= 25; i++) {
        result.current.applyMutation(`{"count": ${i}}`)
      }
    })

    // Undo 20 times (max stack size)
    act(() => {
      for (let i = 0; i < 20; i++) {
        if (result.current.canUndo) {
          result.current.undo()
        }
      }
    })

    // Should get to count: 5 (25 - 20 = 5)
    expect(result.current.parsedJson).toEqual({ count: 5 })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- useJsonEditor.test.ts`
Expected: FAIL - useJsonEditor not defined

**Step 3: Implement useJsonEditor hook**

```typescript
// src/hooks/useJsonEditor.ts
import { useState, useCallback, useEffect } from 'react'
import type { ParseError, UndoEntry } from '@/types'

const MAX_UNDO_STACK = 20

export function useJsonEditor() {
  const [jsonText, setJsonTextInternal] = useState('')
  const [parsedJson, setParsedJson] = useState<any>(null)
  const [parseError, setParseError] = useState<ParseError | null>(null)
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([])

  // Parse JSON whenever text changes
  useEffect(() => {
    if (!jsonText.trim()) {
      setParsedJson(null)
      setParseError(null)
      return
    }

    try {
      const parsed = JSON.parse(jsonText)
      setParsedJson(parsed)
      setParseError(null)
    } catch (error) {
      setParsedJson(null)

      if (error instanceof SyntaxError) {
        // Extract line and column if possible
        const match = error.message.match(/position (\d+)/)
        const position = match ? parseInt(match[1], 10) : undefined

        let line: number | undefined
        let column: number | undefined

        if (position !== undefined) {
          const lines = jsonText.substring(0, position).split('\n')
          line = lines.length
          column = lines[lines.length - 1].length + 1
        }

        setParseError({
          message: error.message,
          line,
          column,
        })
      } else {
        setParseError({
          message: 'Unknown parse error',
        })
      }
    }
  }, [jsonText])

  const setJsonText = useCallback((text: string) => {
    setJsonTextInternal(text)
  }, [])

  const applyMutation = useCallback((newText: string) => {
    setUndoStack(prev => {
      const newStack = [...prev, { text: jsonText, timestamp: Date.now() }]
      // Keep only last MAX_UNDO_STACK items
      return newStack.slice(-MAX_UNDO_STACK)
    })
    setJsonTextInternal(newText)
  }, [jsonText])

  const undo = useCallback(() => {
    if (undoStack.length === 0) return

    const lastEntry = undoStack[undoStack.length - 1]
    setUndoStack(prev => prev.slice(0, -1))
    setJsonTextInternal(lastEntry.text)
  }, [undoStack])

  const canUndo = undoStack.length > 0

  return {
    jsonText,
    setJsonText,
    parsedJson,
    parseError,
    applyMutation,
    undo,
    canUndo,
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- useJsonEditor.test.ts`
Expected: PASS - all tests pass

**Step 5: Commit**

```bash
git add src/hooks/
git commit -m "feat: add useJsonEditor hook with undo support"
```

---

## Task 4: shadcn/ui Setup & Base Styles

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/index.css`
- Create: `components.json`
- Modify: `src/main.tsx`

**Step 1: Create utils for className merging**

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Step 2: Create base styles**

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: system-ui, -apple-system, sans-serif;
  }
}
```

**Step 3: Update main.tsx**

```typescript
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Step 4: Create components.json for shadcn**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Step 5: Install shadcn/ui CLI and add components**

Run: `npx shadcn-ui@latest add button dialog toast`
Expected: Button, Dialog, and Toast components added to src/components/ui/

**Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 7: Commit**

```bash
git add src/lib/ src/index.css src/main.tsx components.json src/components/ui/
git commit -m "feat: setup shadcn/ui with base components"
```

---

## Task 5: Text Editor Component (CodeMirror)

**Files:**
- Create: `src/components/TextEditor.tsx`
- Create: `src/components/TextEditor.test.tsx`

**Step 1: Write TextEditor component test**

```typescript
// src/components/TextEditor.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TextEditor } from './TextEditor'

describe('TextEditor', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <TextEditor
        value=""
        onChange={vi.fn()}
        parseError={null}
      />
    )
    expect(container.querySelector('.cm-editor')).toBeInTheDocument()
  })

  it('displays initial value', () => {
    render(
      <TextEditor
        value='{"name": "John"}'
        onChange={vi.fn()}
        parseError={null}
      />
    )
    // CodeMirror should render the text
    expect(screen.getByText(/"name"/)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- TextEditor.test.tsx`
Expected: FAIL - TextEditor not defined

**Step 3: Implement TextEditor component**

```typescript
// src/components/TextEditor.tsx
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
```

**Step 4: Run test to verify it passes**

Run: `npm test -- TextEditor.test.tsx`
Expected: PASS - all tests pass

**Step 5: Commit**

```bash
git add src/components/TextEditor.tsx src/components/TextEditor.test.tsx
git commit -m "feat: add CodeMirror text editor component"
```

---

## Task 6: Tree View Components

**Files:**
- Create: `src/components/TreeView.tsx`
- Create: `src/components/TreeNode.tsx`
- Create: `src/hooks/useTreeState.ts`

**Step 1: Create tree state hook**

```typescript
// src/hooks/useTreeState.ts
import { useState, useCallback, useMemo } from 'react'
import { flattenJSON } from '@/utils/treeFlattener'
import type { TreeNode } from '@/types'

export function useTreeState(parsedJson: any) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [expandedValues, setExpandedValues] = useState<Set<string>>(new Set())

  const toggleExpanded = useCallback((nodeId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }, [])

  const toggleValueExpanded = useCallback((nodeId: string) => {
    setExpandedValues(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }, [])

  const nodes = useMemo(() => {
    if (!parsedJson) return []
    const flattened = flattenJSON(parsedJson, expandedIds)
    // Apply value expansion state
    return flattened.map(node => ({
      ...node,
      isValueExpanded: expandedValues.has(node.id)
    }))
  }, [parsedJson, expandedIds, expandedValues])

  return {
    nodes,
    toggleExpanded,
    toggleValueExpanded,
  }
}
```

**Step 2: Implement TreeNode component**

```typescript
// src/components/TreeNode.tsx
import { memo } from 'react'
import type { TreeNode as TreeNodeType } from '@/types'
import { generateJSONPath } from '@/utils/jsonPath'
import { ChevronRight, ChevronDown, Copy, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TreeNodeProps {
  node: TreeNodeType
  onToggleExpanded: (nodeId: string) => void
  onToggleValueExpanded: (nodeId: string) => void
  onCopyPath: (path: string) => void
}

export const TreeNode = memo(function TreeNode({
  node,
  onToggleExpanded,
  onToggleValueExpanded,
  onCopyPath,
}: TreeNodeProps) {
  const { id, depth, key, value, type, path, isExpanded, isTruncated, isValueExpanded, isHighlighted, isCurrentMatch } = node

  const handleRowClick = () => {
    const jsonPath = generateJSONPath(path)
    onCopyPath(jsonPath)
  }

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleExpanded(id)
  }

  const handleValueExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleValueExpanded(id)
  }

  const renderValue = () => {
    if (type === 'object') {
      const count = Object.keys(value).length
      return <span className="text-muted-foreground">Object {`{${count}}`}</span>
    }

    if (type === 'array') {
      return <span className="text-muted-foreground">Array [{value.length}]</span>
    }

    // Primitive value
    const stringValue = JSON.stringify(value)
    const displayValue = isTruncated && !isValueExpanded
      ? stringValue.substring(0, 100) + '...'
      : stringValue

    return (
      <span className="text-green-600">
        {displayValue}
        {isTruncated && (
          <button
            onClick={handleValueExpandClick}
            className="ml-2 text-xs text-blue-600 hover:underline"
          >
            {isValueExpanded ? <Minimize2 className="inline w-3 h-3" /> : <Maximize2 className="inline w-3 h-3" />}
          </button>
        )}
      </span>
    )
  }

  return (
    <div
      className={cn(
        'flex items-start gap-2 py-1 px-2 hover:bg-gray-100 cursor-pointer transition-colors',
        isHighlighted && 'bg-yellow-100',
        isCurrentMatch && 'bg-yellow-200'
      )}
      style={{ paddingLeft: `${depth * 20 + 8}px` }}
      onClick={handleRowClick}
    >
      {type !== 'primitive' && (
        <button
          onClick={handleExpandClick}
          className="flex-shrink-0 mt-1"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      )}
      {type === 'primitive' && <div className="w-4" />}

      <span className="text-blue-600 font-medium">{key}:</span>
      {renderValue()}
    </div>
  )
})
```

**Step 3: Implement TreeView component**

```typescript
// src/components/TreeView.tsx
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import type { TreeNode as TreeNodeType } from '@/types'
import { TreeNode } from './TreeNode'

interface TreeViewProps {
  nodes: TreeNodeType[]
  onToggleExpanded: (nodeId: string) => void
  onToggleValueExpanded: (nodeId: string) => void
  onCopyPath: (path: string) => void
  emptyMessage?: string
}

export function TreeView({
  nodes,
  onToggleExpanded,
  onToggleValueExpanded,
  onCopyPath,
  emptyMessage = 'Paste JSON or upload a file to get started',
}: TreeViewProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: nodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32, // Estimated row height
    overscan: 10,
  })

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div ref={parentRef} className="h-full overflow-auto" role="tree">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const node = nodes[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
              role="treeitem"
            >
              <TreeNode
                node={node}
                onToggleExpanded={onToggleExpanded}
                onToggleValueExpanded={onToggleValueExpanded}
                onCopyPath={onCopyPath}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 4: Install lucide-react icons**

Run: `npm install lucide-react`
Expected: Package installed

**Step 5: Test in dev mode**

Run: `npm run dev`
Expected: Can see tree view in browser (will wire up in App component next)

**Step 6: Commit**

```bash
git add src/components/TreeView.tsx src/components/TreeNode.tsx src/hooks/useTreeState.ts
git commit -m "feat: add virtualized tree view with expand/collapse"
```

---

## Task 7: Main App Layout & Integration

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/ErrorBanner.tsx`
- Create: `src/components/Toolbar.tsx`
- Modify: `src/App.tsx`
- Create: `src/App.css`

**Step 1: Implement Header component**

```typescript
// src/components/Header.tsx
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onFileUpload: (file: File) => void
}

export function Header({ onFileUpload }: HeaderProps) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
    // Reset input so same file can be uploaded again
    e.target.value = ''
  }

  return (
    <header className="border-b bg-white px-4 py-3 flex items-center justify-between">
      <h1 className="text-xl font-semibold">JSON Viewer & Editor</h1>

      <div>
        <input
          type="file"
          id="file-upload"
          accept=".json,application/json"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button asChild variant="outline" size="sm">
          <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload File
          </label>
        </Button>
      </div>
    </header>
  )
}
```

**Step 2: Implement ErrorBanner component**

```typescript
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
```

**Step 3: Implement Toolbar component (basic version)**

```typescript
// src/components/Toolbar.tsx
import { Wrench, Undo } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ToolbarProps {
  onAutoRepair: () => void
  onUndo: () => void
  canUndo: boolean
  hasError: boolean
}

export function Toolbar({ onAutoRepair, onUndo, canUndo, hasError }: ToolbarProps) {
  return (
    <div className="border-b bg-white px-4 py-2 flex items-center gap-2">
      <Button
        onClick={onAutoRepair}
        variant="outline"
        size="sm"
        disabled={!hasError}
      >
        <Wrench className="w-4 h-4 mr-2" />
        Auto-Repair
      </Button>

      <Button
        onClick={onUndo}
        variant="outline"
        size="sm"
        disabled={!canUndo}
      >
        <Undo className="w-4 h-4 mr-2" />
        Undo
      </Button>

      {/* Will add Case Conversion and Search in next tasks */}
    </div>
  )
}
```

**Step 4: Implement main App component**

```typescript
// src/App.tsx
import { useState, useCallback } from 'react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Header } from '@/components/Header'
import { Toolbar } from '@/components/Toolbar'
import { TextEditor } from '@/components/TextEditor'
import { TreeView } from '@/components/TreeView'
import { ErrorBanner } from '@/components/ErrorBanner'
import { useJsonEditor } from '@/hooks/useJsonEditor'
import { useTreeState } from '@/hooks/useTreeState'
import { useToast } from '@/components/ui/use-toast'
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
    applyMutation,
    undo,
    canUndo,
  } = useJsonEditor()

  const {
    nodes,
    toggleExpanded,
    toggleValueExpanded,
  } = useTreeState(parsedJson)

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
    toast({
      title: 'Path copied!',
      description: path,
      duration: 2000,
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
```

```css
/* src/App.css */
#root {
  height: 100vh;
  overflow: hidden;
}
```

**Step 5: Install react-resizable-panels**

Run: `npm install react-resizable-panels`
Expected: Package installed

**Step 6: Add resizable component from shadcn**

Run: `npx shadcn-ui@latest add resizable`
Expected: Resizable component added

**Step 7: Test in browser**

Run: `npm run dev`
Expected: Full app renders with two-pane layout, can upload files, see tree view

**Step 8: Commit**

```bash
git add src/components/Header.tsx src/components/ErrorBanner.tsx src/components/Toolbar.tsx src/App.tsx src/App.css
git commit -m "feat: integrate main app layout with header, toolbar, and error banner"
```

---

## Task 8: Auto-Repair with Preview Modal

**Files:**
- Create: `src/components/PreviewModal.tsx`
- Create: `src/hooks/useAutoRepair.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/Toolbar.tsx`

**Step 1: Implement useAutoRepair hook**

```typescript
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
```

**Step 2: Implement PreviewModal component**

```typescript
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
```

**Step 3: Update App.tsx to use auto-repair**

```typescript
// Modify src/App.tsx - add these changes

import { useAutoRepair } from '@/hooks/useAutoRepair'
import { PreviewModal } from '@/components/PreviewModal'

// Inside App component, add:
const autoRepair = useAutoRepair()

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

// Add before </div> closing tag:
<PreviewModal
  isOpen={autoRepair.isOpen}
  onClose={autoRepair.close}
  original={autoRepair.original}
  modified={autoRepair.repaired}
  title="Auto-Repair Preview"
  onAccept={handleAcceptRepair}
/>
```

**Step 4: Install diff library**

Run: `npm install diff @types/diff`
Expected: Package installed

**Step 5: Test auto-repair in browser**

Run: `npm run dev`
Test: Paste invalid JSON like `{ "name": "John", }` and click Auto-Repair
Expected: Preview modal shows diff with trailing comma removed

**Step 6: Commit**

```bash
git add src/hooks/useAutoRepair.ts src/components/PreviewModal.tsx src/App.tsx
git commit -m "feat: add auto-repair with preview modal"
```

---

## Task 9: Case Conversion

**Files:**
- Create: `src/hooks/useCaseConversion.ts`
- Create: `src/components/CaseConversionDialog.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Toolbar.tsx`

**Step 1: Implement useCaseConversion hook**

```typescript
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
```

**Step 2: Implement CaseConversionDialog component**

```typescript
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
```

**Step 3: Add Label and RadioGroup from shadcn**

Run: `npx shadcn-ui@latest add label radio-group`
Expected: Components added

**Step 4: Update Toolbar to include Case Conversion button**

```typescript
// Modify src/components/Toolbar.tsx

import { Wrench, Undo, Type } from 'lucide-react'

interface ToolbarProps {
  onAutoRepair: () => void
  onUndo: () => void
  onCaseConversion: () => void
  canUndo: boolean
  hasError: boolean
  hasValidJson: boolean
}

export function Toolbar({
  onAutoRepair,
  onUndo,
  onCaseConversion,
  canUndo,
  hasError,
  hasValidJson,
}: ToolbarProps) {
  return (
    <div className="border-b bg-white px-4 py-2 flex items-center gap-2">
      <Button
        onClick={onAutoRepair}
        variant="outline"
        size="sm"
        disabled={!hasError}
      >
        <Wrench className="w-4 h-4 mr-2" />
        Auto-Repair
      </Button>

      <Button
        onClick={onCaseConversion}
        variant="outline"
        size="sm"
        disabled={!hasValidJson}
      >
        <Type className="w-4 h-4 mr-2" />
        Convert Case
      </Button>

      <Button
        onClick={onUndo}
        variant="outline"
        size="sm"
        disabled={!canUndo}
      >
        <Undo className="w-4 h-4 mr-2" />
        Undo
      </Button>
    </div>
  )
}
```

**Step 5: Update App.tsx to use case conversion**

```typescript
// Modify src/App.tsx - add these changes

import { useCaseConversion } from '@/hooks/useCaseConversion'
import { CaseConversionDialog } from '@/components/CaseConversionDialog'

// Inside App component, add:
const caseConversion = useCaseConversion()

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

// Update Toolbar props:
<Toolbar
  onAutoRepair={handleAutoRepair}
  onUndo={undo}
  onCaseConversion={handleCaseConversion}
  canUndo={canUndo}
  hasError={!!parseError}
  hasValidJson={!!parsedJson}
/>

// Add before </div> closing tag:
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
```

**Step 6: Add CaseDirection and CaseDepth imports to App.tsx**

```typescript
import type { CaseDirection, CaseDepth } from '@/types'
```

**Step 7: Test case conversion in browser**

Run: `npm run dev`
Test: Paste valid JSON with snake_case keys, click Convert Case, select snake→camel and Deep
Expected: Preview shows converted keys

**Step 8: Commit**

```bash
git add src/hooks/useCaseConversion.ts src/components/CaseConversionDialog.tsx src/App.tsx src/components/Toolbar.tsx
git commit -m "feat: add case conversion with dialog and preview"
```

---

## Task 10: Search & Navigation

**Files:**
- Create: `src/hooks/useSearch.ts`
- Create: `src/components/SearchBar.tsx`
- Modify: `src/components/Toolbar.tsx`
- Modify: `src/hooks/useTreeState.ts`
- Modify: `src/App.tsx`

**Step 1: Implement useSearch hook**

```typescript
// src/hooks/useSearch.ts
import { useState, useCallback, useMemo } from 'react'
import type { TreeNode, SearchState } from '@/types'

export function useSearch(nodes: TreeNode[]) {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    matchingNodeIds: [],
    currentMatchIndex: -1,
  })

  const search = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchState({
        query: '',
        matchingNodeIds: [],
        currentMatchIndex: -1,
      })
      return
    }

    const lowerQuery = query.toLowerCase()
    const matching = nodes
      .filter(node => {
        const keyMatch = node.key.toLowerCase().includes(lowerQuery)
        const valueMatch = typeof node.value === 'string'
          ? node.value.toLowerCase().includes(lowerQuery)
          : String(node.value).toLowerCase().includes(lowerQuery)
        return keyMatch || valueMatch
      })
      .map(node => node.id)

    setSearchState({
      query,
      matchingNodeIds: matching,
      currentMatchIndex: matching.length > 0 ? 0 : -1,
    })
  }, [nodes])

  const next = useCallback(() => {
    setSearchState(prev => {
      if (prev.matchingNodeIds.length === 0) return prev
      const nextIndex = (prev.currentMatchIndex + 1) % prev.matchingNodeIds.length
      return { ...prev, currentMatchIndex: nextIndex }
    })
  }, [])

  const previous = useCallback(() => {
    setSearchState(prev => {
      if (prev.matchingNodeIds.length === 0) return prev
      const prevIndex = prev.currentMatchIndex - 1 < 0
        ? prev.matchingNodeIds.length - 1
        : prev.currentMatchIndex - 1
      return { ...prev, currentMatchIndex: prevIndex }
    })
  }, [])

  const clear = useCallback(() => {
    setSearchState({
      query: '',
      matchingNodeIds: [],
      currentMatchIndex: -1,
    })
  }, [])

  const currentMatchId = searchState.currentMatchIndex >= 0
    ? searchState.matchingNodeIds[searchState.currentMatchIndex]
    : null

  return {
    searchState,
    currentMatchId,
    search,
    next,
    previous,
    clear,
  }
}
```

**Step 2: Implement SearchBar component**

```typescript
// src/components/SearchBar.tsx
import { useState, useEffect } from 'react'
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  onSearch: (query: string) => void
  onNext: () => void
  onPrevious: () => void
  onClear: () => void
  matchCount: number
  currentIndex: number
}

export function SearchBar({
  onSearch,
  onNext,
  onPrevious,
  onClear,
  matchCount,
  currentIndex,
}: SearchBarProps) {
  const [query, setQuery] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, onSearch])

  const handleClear = () => {
    setQuery('')
    onClear()
  }

  const displayCount = matchCount > 0
    ? `${currentIndex + 1} of ${matchCount}`
    : matchCount === 0 && query
    ? 'No matches'
    : ''

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8 pr-8"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-2"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {displayCount && (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {displayCount}
        </span>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={matchCount === 0}
      >
        <ChevronUp className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={matchCount === 0}
      >
        <ChevronDown className="w-4 h-4" />
      </Button>
    </div>
  )
}
```

**Step 3: Update useTreeState to accept search state**

```typescript
// Modify src/hooks/useTreeState.ts

export function useTreeState(parsedJson: any, searchMatchIds?: Set<string>, currentMatchId?: string | null) {
  // ... existing code ...

  const nodes = useMemo(() => {
    if (!parsedJson) return []

    const searchState = searchMatchIds && currentMatchId !== undefined ? {
      query: '',
      matchingNodeIds: searchMatchIds,
      currentMatchId,
    } : undefined

    const flattened = flattenJSON(parsedJson, expandedIds, searchState)

    // Apply value expansion state
    return flattened.map(node => ({
      ...node,
      isValueExpanded: expandedValues.has(node.id)
    }))
  }, [parsedJson, expandedIds, expandedValues, searchMatchIds, currentMatchId])

  // ... rest of code ...
}
```

**Step 4: Update flattenJSON to use searchState parameter**

```typescript
// Modify src/utils/treeFlattener.ts - already has searchState parameter from earlier, just ensure it's used correctly

// The implementation is already correct from Task 2
```

**Step 5: Update Toolbar to include SearchBar**

```typescript
// Modify src/components/Toolbar.tsx

import { SearchBar } from './SearchBar'

interface ToolbarProps {
  onAutoRepair: () => void
  onUndo: () => void
  onCaseConversion: () => void
  canUndo: boolean
  hasError: boolean
  hasValidJson: boolean
  // Search props
  onSearch: (query: string) => void
  onSearchNext: () => void
  onSearchPrevious: () => void
  onSearchClear: () => void
  searchMatchCount: number
  searchCurrentIndex: number
}

export function Toolbar({
  onAutoRepair,
  onUndo,
  onCaseConversion,
  canUndo,
  hasError,
  hasValidJson,
  onSearch,
  onSearchNext,
  onSearchPrevious,
  onSearchClear,
  searchMatchCount,
  searchCurrentIndex,
}: ToolbarProps) {
  return (
    <div className="border-b bg-white px-4 py-2 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={onAutoRepair}
          variant="outline"
          size="sm"
          disabled={!hasError}
        >
          <Wrench className="w-4 h-4 mr-2" />
          Auto-Repair
        </Button>

        <Button
          onClick={onCaseConversion}
          variant="outline"
          size="sm"
          disabled={!hasValidJson}
        >
          <Type className="w-4 h-4 mr-2" />
          Convert Case
        </Button>

        <Button
          onClick={onUndo}
          variant="outline"
          size="sm"
          disabled={!canUndo}
        >
          <Undo className="w-4 h-4 mr-2" />
          Undo
        </Button>
      </div>

      <div className="flex-1 max-w-md">
        <SearchBar
          onSearch={onSearch}
          onNext={onSearchNext}
          onPrevious={onSearchPrevious}
          onClear={onSearchClear}
          matchCount={searchMatchCount}
          currentIndex={searchCurrentIndex}
        />
      </div>
    </div>
  )
}
```

**Step 6: Update App.tsx to integrate search**

```typescript
// Modify src/App.tsx

import { useSearch } from '@/hooks/useSearch'

// Inside App component:
const {
  nodes: baseNodes,
  toggleExpanded,
  toggleValueExpanded,
} = useTreeState(parsedJson)

const {
  searchState,
  currentMatchId,
  search,
  next: searchNext,
  previous: searchPrevious,
  clear: searchClear,
} = useSearch(baseNodes)

// Update useTreeState call to include search:
const {
  nodes,
  toggleExpanded,
  toggleValueExpanded,
} = useTreeState(
  parsedJson,
  new Set(searchState.matchingNodeIds),
  currentMatchId
)

// Update Toolbar props:
<Toolbar
  onAutoRepair={handleAutoRepair}
  onUndo={undo}
  onCaseConversion={handleCaseConversion}
  canUndo={canUndo}
  hasError={!!parseError}
  hasValidJson={!!parsedJson}
  onSearch={search}
  onSearchNext={searchNext}
  onSearchPrevious={searchPrevious}
  onSearchClear={searchClear}
  searchMatchCount={searchState.matchingNodeIds.length}
  searchCurrentIndex={searchState.currentMatchIndex}
/>
```

**Step 7: Add Input from shadcn**

Run: `npx shadcn-ui@latest add input`
Expected: Input component added

**Step 8: Test search in browser**

Run: `npm run dev`
Test: Paste JSON, search for a key/value, use prev/next buttons
Expected: Matching nodes highlighted, navigation works

**Step 9: Commit**

```bash
git add src/hooks/useSearch.ts src/components/SearchBar.tsx src/hooks/useTreeState.ts src/components/Toolbar.tsx src/App.tsx
git commit -m "feat: add search with highlighting and navigation"
```

---

## Task 11: GitHub Actions Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `vite.config.ts` (confirm base path)
- Create: `README.md` update with deployment instructions

**Step 1: Create GitHub Actions workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: Verify vite.config.ts base path**

```typescript
// Confirm this is set correctly in vite.config.ts
base: '/json-editor/',  // Should match your GitHub repo name
```

**Step 3: Create .github directory**

Run: `mkdir -p .github/workflows`
Expected: Directory created

**Step 4: Test build locally**

Run: `npm run build && npm run preview`
Expected: Build succeeds, preview shows app working

**Step 5: Commit workflow**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow for deployment"
```

**Step 6: Push to GitHub and enable Pages**

Manual steps:
1. Push to GitHub: `git push origin main`
2. Go to repository Settings → Pages
3. Source: GitHub Actions
4. Wait for workflow to complete
5. Visit deployed site

---

## Task 12: Final Testing & Documentation

**Files:**
- Modify: `README.md`
- Create: `docs/DEVELOPMENT.md`

**Step 1: Update README.md with project info**

Update the README.md file with:
- Live demo link (GitHub Pages URL)
- Features list
- Development instructions
- Build and deployment info

**Step 2: Create development documentation**

```markdown
# docs/DEVELOPMENT.md

# Development Guide

## Setup

\`\`\`bash
npm install
npm run dev
\`\`\`

## Testing

\`\`\`bash
npm test
npm run test:ui
\`\`\`

## Building

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Architecture

See design document: `docs/plans/2026-01-21-json-viewer-design.md`

## Key Technologies

- React 19.2 + TypeScript
- Vite for build
- CodeMirror 6 for text editor
- @tanstack/react-virtual for tree view
- Tailwind CSS + shadcn/ui for styling
```

**Step 3: Run full test suite**

Run: `npm test`
Expected: All tests pass

**Step 4: Manual testing checklist**

Test in browser:
- [ ] Upload JSON file
- [ ] Paste JSON in editor
- [ ] Invalid JSON shows error banner
- [ ] Auto-repair works with preview
- [ ] Case conversion (both directions, deep/shallow)
- [ ] Undo after mutations
- [ ] Search with highlighting
- [ ] Navigate search results
- [ ] Copy JSONPath on node click
- [ ] Expand/collapse tree nodes
- [ ] Expand/collapse long values
- [ ] Resizable panes
- [ ] Large file handling (test with 5MB+ file)

**Step 5: Commit documentation**

```bash
git add README.md docs/DEVELOPMENT.md
git commit -m "docs: update README and add development guide"
```

**Step 6: Final push**

```bash
git push origin feature/json-viewer-implementation
```

---

## Success Criteria Checklist

- ✅ Paste malformed JSON, auto-repair with one click
- ✅ Convert case (deep/shallow) with preview
- ✅ Handle 10MB+ JSON files without UI freeze
- ✅ Search and navigate through large files
- ✅ Copy JSONPath from any node
- ✅ Undo mutations
- ✅ All features work offline (no network calls)
- ✅ Keyboard accessible
- ✅ Deployed to GitHub Pages

---

## Notes

- **Use @frontend-design skill** when implementing UI components for distinctive, high-quality design
- All mutations go through `applyMutation` to maintain undo stack
- Text editor is source of truth - tree view is always derived
- Virtualization is always enabled for consistency
- Remember to set correct base path in vite.config.ts for GitHub Pages
