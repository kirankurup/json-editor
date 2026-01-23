export type NodeType = 'object' | 'array' | 'primitive'

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

export interface TreeNode {
  id: string
  depth: number
  key: string
  value: JSONValue
  type: NodeType
  path: (string | number)[]
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
