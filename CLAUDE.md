# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JSON Viewer & Editor - A UI-first, browser-based JSON viewer and editor with auto-repair, case conversion, search, and navigation capabilities. All processing happens client-side with no network calls.

## Tech Stack

- **Frontend**: TypeScript, React 19.2 (with React Compiler)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Key Libraries**:
  - `@tanstack/react-virtual` - Virtualized tree rendering for large files (≥5MB, ≥100k nodes)
  - `jsonrepair` - Safe auto-repair for malformed JSON

## Development Commands

*Note: This project is in early stages. Once implementation begins, add the actual build, test, and dev commands here.*

Expected commands (to be confirmed once package.json exists):
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run linter
- `npm test` - Run tests

## Architecture

### Component Hierarchy

```
App
├── Header (title, file upload button)
├── EditorLayout (resizable two-pane split - react-resizable-panels)
│   ├── TextEditor (left pane - CodeMirror 6)
│   │   └── Error decorations (inline red underlines)
│   └── TreeView (right pane)
│       ├── VirtualizedTree (@tanstack/react-virtual)
│       └── NodeRenderer (copy path, search highlights, value expansion)
├── Toolbar (auto-repair, case conversion, search with prev/next)
├── ErrorBanner (bottom, shows parse errors)
└── PreviewModal (diff view for mutations)
```

### State Management

Use React's built-in state (useState + useReducer). Central `useJsonEditor` hook manages:
- `jsonText` - Raw text in left pane (source of truth)
- `parsedJson` - Parsed object (null if invalid)
- `parseError` - Error details if JSON is invalid
- `undoStack` - Previous states for mutations (max 20 items)
- `searchState` - Current query and match indices

### Key Design Decisions

1. **Text editor is source of truth**: All mutations update text, then re-parse to update tree
2. **Always virtualize**: Use `@tanstack/react-virtual` for all files (simpler, consistent)
3. **CodeMirror 6**: Lightweight, modern, excellent React support for JSON editing
4. **Modal previews**: Auto-repair and case conversion show side-by-side diff in modal before applying
5. **Manual triggers only**: Auto-repair requires user click (not automatic on paste)
6. **Dynamic row heights**: Tree view supports expandable values (truncate at ~100 chars with expand button)

### Core Features & Design Principles

**Two-Pane Layout**
- Left pane: CodeMirror 6 JSON text editor with syntax highlighting
- Right pane: Always-virtualized tree visualization
- Resizable divider (50/50 default, persisted to localStorage, 300px min per pane)

**Safe Operations**
- All mutations (auto-repair, case conversion) show diff preview in modal before applying
- Undo support for mutations only (not text edits)
- Changes are always user-confirmed via modal

**Error Handling**
- Inline red underlines at error position in editor
- Bottom banner with specific error message and "Auto-Repair" button
- Tree view shows empty state when JSON invalid

**Performance**
- Virtualized tree rendering for all files (consistent behavior)
- Debounced parsing for large files >1MB
- Local-first: all processing in-browser, no network calls

**Key Capabilities**
1. **Auto-Repair**: Fix common JSON errors using `jsonrepair` (manual trigger, modal preview)
2. **Case Conversion**: Convert keys between snake_case ↔ camelCase (Deep/Shallow modes, modal preview)
3. **Path Copy**: Click any node to copy its JSONPath (e.g., `$.users[0].name`)
4. **Search**: Plain-text search with highlighting, prev/next navigation, match counter
5. **File Upload**: Upload button populates editor, handles large files with warning
6. **Accessibility**: Keyboard navigation (Tab, Enter, Escape), ARIA roles, focus indicators

## Implementation Guidelines

### Frontend Design

**ALWAYS use the `frontend-design` skill for UI implementation** to ensure high-quality, distinctive design that avoids generic AI aesthetics.

### Tree Node Data Structure

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

### Deployment

**GitHub Pages**: Configure Vite with correct base path:
```typescript
// vite.config.ts
base: '/json-editor/' // or actual repo name
```

## Git Commits
Do not add Co-Authored-By lines to commit messages.

## Issue Tracking & Workflow

This project uses **bd** (beads) for issue tracking. See AGENTS.md for the full workflow.

### Task Execution Protocol

**BEFORE attempting any task:**
1. Run `bd ready` to find available work
2. Run `bd show <id>` to view issue details and dependencies
3. Check priority (P0-P4) and dependencies
4. Run `bd update <id> --status=in_progress` to claim work

**DURING task execution:**
- Consider parallel execution for independent tasks (no blockers, different components)
- Respect dependencies - do not start blocked tasks
- Update issue status if blocked or needs clarification

**AFTER completing task:**
1. Run quality gates (tests, linters, builds) if code changed
2. Run `bd close <id>` to mark complete
3. Run `bd sync` to commit beads changes
4. Create new issues for discovered work (use `bd create`)

Quick reference:
```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd list --status=open # All open issues
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd create --title="..." --type=task --priority=2  # Create new issue
bd dep add <issue> <depends-on>  # Add dependency
bd sync               # Sync with git
```

## Session Completion Protocol

When ending a work session, you MUST:
1. File issues for remaining work
2. Run quality gates if code changed (tests, linters, builds)
3. Update issue status (close finished work)
4. Push to remote:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```

Work is NOT complete until `git push` succeeds.
