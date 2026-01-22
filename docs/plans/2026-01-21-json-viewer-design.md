# JSON Viewer & Editor - Design Document

**Date**: 2026-01-21
**Status**: Approved
**Target**: v1.0 - GitHub Pages deployment

## Overview

A polished, browser-based JSON viewer and editor for developers. Key differentiators: auto-repair for malformed JSON, case conversion (snake_case ↔ camelCase), virtualized tree rendering for large files, and all processing happens client-side.

**Primary Use Case**: Developer tool for debugging, inspecting, and transforming JSON data (API responses, config files, exports).

## Architecture

### State Management

Use React's built-in state (useState + useReducer). No external state library needed.

Central `useJsonEditor` hook manages:
- `jsonText` - Raw text in left pane (source of truth)
- `parsedJson` - Parsed object (null if invalid)
- `parseError` - Error details if JSON is invalid
- `undoStack` - Previous states for mutations (max 20 items)
- `searchState` - Current query and match indices

### Component Hierarchy

```
App
├── Header (title, file upload button)
├── EditorLayout (resizable two-pane split)
│   ├── TextEditor (left pane)
│   │   ├── CodeMirror 6 editor with JSON syntax highlighting
│   │   └── Error decorations (inline red underlines)
│   └── TreeView (right pane)
│       ├── VirtualizedTree (@tanstack/react-virtual)
│       └── NodeRenderer (copy path, search highlights, value expansion)
├── Toolbar (auto-repair, case conversion, search)
├── ErrorBanner (bottom, shows parse errors)
└── PreviewModal (diff view for mutations)
```

### Data Flow

Text editor is source of truth:
1. User edits text or uploads file → update `jsonText`
2. Attempt to parse → update `parsedJson` or `parseError`
3. If valid, flatten into tree nodes → render tree view
4. Mutations (repair, case conversion) → update text → re-parse → re-render tree

## Core Components

### Text Editor (Left Pane)

**Library**: CodeMirror 6
- Modern, lightweight, excellent React support
- JSON syntax highlighting
- Error decoration API for inline indicators
- Controlled component synced with `jsonText` state

**Features**:
- Paste handling for large files (debounce parse for >1MB)
- Red squiggly underlines at error positions (from parse error line/column)
- Standard editor keyboard shortcuts (Cmd/Ctrl+Z, Cmd/Ctrl+A, etc.)

### Tree View (Right Pane)

**Virtualization**: Always use `@tanstack/react-virtual` regardless of file size (simpler, consistent behavior)

**Tree Node Data Structure**:
```typescript
type TreeNode = {
  id: string;              // unique node ID
  depth: number;           // indentation level
  key: string;             // property name
  value: any;              // actual value
  type: 'object' | 'array' | 'primitive';
  path: string[];          // JSONPath array
  isExpanded: boolean;     // for objects/arrays
  isTruncated: boolean;    // if value length > 100 chars
  isValueExpanded: boolean; // user clicked expand button
  isHighlighted: boolean;  // search match
  isCurrentMatch: boolean; // current search position
}
```

**Dynamic Row Heights**:
- Use react-virtual's dynamic size mode
- Measure row height when `isValueExpanded` changes
- Cache measurements to avoid layout thrashing

**Node Rendering**:
- Key name (if object property)
- Value preview (truncated to ~100 chars if long)
- Type badge for objects/arrays (e.g., "Array [5]", "Object {3}")
- Collapse/expand icon for objects/arrays
- Expand button for truncated values (shows full value with dynamic height)
- Click anywhere on row → copy JSONPath to clipboard

**Empty States**:
- No JSON loaded: "Paste JSON or upload a file to get started"
- Invalid JSON: "Invalid JSON - see errors below"

## Features

### File Upload

**Trigger**: Upload button in header
**Input**: Standard file input with `accept=".json,application/json"`
**Flow**:
1. Read file using FileReader API
2. If >10MB, show warning: "Large file detected (X MB). This may take a moment to parse."
3. Set `jsonText` to file contents
4. Auto-parse and render tree

**Edge Cases**:
- Empty file → empty editor
- Non-JSON extension → attempt parse, show errors if invalid
- Multiple uploads → replace current content (no confirmation needed)

### Auto-Repair

**Trigger**: User clicks "Auto-Repair" button in toolbar (manual only)

**Flow**:
1. Pass `jsonText` to `jsonrepair` library
2. Get repaired JSON string
3. Open `PreviewModal` with side-by-side diff:
   - Left: original (error highlights)
   - Right: repaired (fix highlights)
   - Use `diff` library to compute changes
4. User clicks "Accept" → update `jsonText`, push old state to `undoStack`
5. User clicks "Cancel" → close modal, no changes

### Case Conversion

**Trigger**: User clicks "Convert Case" button in toolbar

**Flow**:
1. Show dialog to select:
   - Direction: snake_case → camelCase OR camelCase → snake_case
   - Depth: **Deep** (all levels, default) or **Shallow** (first level only)
2. Traverse `parsedJson`, create new object with converted keys
3. Stringify with 2-space indentation
4. Open `PreviewModal` with diff view (same as auto-repair)
5. Accept → update `jsonText` + push to undo stack
6. Cancel → close modal

### Undo

**Scope**: Auto-repair and case conversion only (not text edits)

**Implementation**:
- `undoStack: Array<{text: string, timestamp: number}>`
- Max stack size: 20 operations
- "Undo" button appears when stack is non-empty
- Click → pop from stack, restore previous `jsonText`

### Search & Navigation

**UI**: Search bar in toolbar with text input, "Previous" and "Next" buttons, match counter

**Algorithm**:
1. Debounce search input (300ms)
2. Search flattened tree nodes (case-insensitive match on both key and value)
3. Store array of matching node IDs and current match index

**Highlighting**:
- Yellow background for all matches
- Darker yellow for current match
- Auto-scroll current match into view

**Navigation**:
- "Next" → increment index, scroll to match
- "Previous" → decrement index, scroll to match
- Wrap around at boundaries

### Path Copy

**Trigger**: Click any node in tree view

**Format**: JSONPath (e.g., `$.users[0].address.city`)

**Flow**:
1. Generate JSONPath from node's `path` array
2. Copy to clipboard via `navigator.clipboard.writeText()`
3. Show toast: "Path copied!" (2 second auto-dismiss)

## Error Handling

### Invalid JSON Display

**Inline indicators**: Red squiggly underlines in editor at error position (via CodeMirror diagnostics)

**Bottom banner**: Fixed position at bottom showing:
- Icon + "Invalid JSON"
- Specific error message (e.g., "Unexpected token } at line 15, column 8")
- "Auto-Repair" button
- Close button (hides banner but doesn't fix error)

**Tree view**: Show empty state when JSON invalid

## Styling

### Design System

- **Framework**: Tailwind CSS
- **Components**: shadcn/ui (Button, Input, Dialog, Toast, Badge)
- **Layout**: Resizable two-pane split (use `react-resizable-panels`)
  - Default: 50/50 split
  - Min width per pane: 300px
  - Persist split position to localStorage

### Colors

- Syntax highlighting: Standard JSON colors (keys blue, strings green, numbers orange)
- Errors: Red underlines, red banner
- Search: Yellow highlights, darker yellow for current match
- Tree hover: Subtle gray background

### Accessibility

**ARIA Roles**:
- `role="tree"` on tree view
- `role="treeitem"` on each node
- `aria-expanded` for collapsible nodes
- `aria-label` on icon buttons
- `aria-live` regions for dynamic updates (error messages, search count)

**Keyboard Navigation**:
- Tab order: upload → editor → toolbar → tree
- Enter on tree node → copy path
- Escape → close modals, clear search

**Focus Indicators**: Visible focus rings on all interactive elements

**Responsive**: Minimum viewport width ~800px (desktop-focused tool)

## Testing

### Test Coverage

**Unit tests**:
- JSONPath generation
- Case conversion logic (deep/shallow)
- Tree flattening algorithm

**Component tests**:
- TreeNode rendering (collapsed, expanded, truncated values)
- PreviewModal with various diffs
- Search highlighting

**Integration tests**:
- Full auto-repair flow with undo
- Full case conversion flow with undo
- File upload → parse → render

**Manual testing**:
- Large file performance (5MB, 10MB, 20MB files)
- Edge cases (empty file, binary file, deeply nested JSON)

**Testing Library**: Vitest + React Testing Library

## Deployment

### GitHub Pages Setup

**Vite Configuration**:
```typescript
// vite.config.ts
export default defineConfig({
  base: '/json-editor/', // repo name
  // ... other config
})
```

**GitHub Actions Workflow**:
- Trigger on push to main
- Run `npm run build`
- Deploy `dist/` to gh-pages branch

**Repository Settings**: Enable GitHub Pages from gh-pages branch

### Build Optimization

- Code splitting: Lazy load CodeMirror if needed
- Tree-shake unused shadcn components
- Target: <200KB gzipped for initial bundle

### Browser Support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge - last 2 versions). No IE11 support.

## Implementation Notes

1. **Use frontend-design skill** for actual UI implementation to ensure high-quality, distinctive design
2. All mutations operate on text representation (not parsed object) to preserve formatting
3. Text editor is source of truth - tree view is always derived from parsed text
4. Virtualization is always enabled for simplicity and consistency
5. GitHub Pages deployment requires correct base path in Vite config

## Success Criteria

- ✅ Paste malformed JSON, auto-repair with one click
- ✅ Convert case (deep/shallow) with preview
- ✅ Handle 10MB+ JSON files without UI freeze
- ✅ Search and navigate through large files
- ✅ Copy JSONPath from any node
- ✅ Undo mutations
- ✅ All features work offline (no network calls)
- ✅ Keyboard accessible
- ✅ Deployed to GitHub Pages
