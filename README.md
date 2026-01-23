# JSON Viewer & Editor

A fast, browser-based JSON viewer and editor with auto-repair, case conversion, and search capabilities. All processing happens client-side with no network calls.

## Features

### 🎯 Core Functionality
- **Two-Pane Layout**: Side-by-side text editor and tree view with resizable divider
- **Live Parsing**: JSON automatically parses as you type with instant error feedback
- **Virtualized Rendering**: Handles large JSON files (10MB+) smoothly
- **File Upload**: Drag & drop or click to upload JSON files

### 🔧 Smart Tools
- **Auto-Repair**: Fix malformed JSON with one click
  - Handles trailing commas, missing quotes, extra commas
  - Shows side-by-side diff before applying
  - Powered by `jsonrepair` library

- **Case Conversion**: Convert object keys between naming conventions
  - `snake_case` ↔ `camelCase`
  - Deep mode: converts all nested levels
  - Shallow mode: converts first level only
  - Preview diff before applying

- **Search & Navigate**: Find keys and values quickly
  - Real-time highlighting of matches
  - Next/Previous navigation with arrow buttons
  - Keyboard shortcuts: `Enter` (next), `Shift+Enter` (previous), `Escape` (clear)
  - Auto-scroll to current match
  - Auto-expand parent nodes to reveal matches

### ✨ User Experience
- **Path Copy**: Click any tree node to copy its JSONPath (e.g., `$.users[0].name`)
- **Undo System**: Undo mutations (auto-repair, case conversion) with one click
- **Error Display**: Clear error messages with line and column numbers
- **Expand/Collapse**: Navigate large JSON structures easily
- **Value Expansion**: Long string values truncated with expand button
- **Keyboard Accessible**: Full keyboard navigation support

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd json-editor

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173/json-editor/`

## Usage Guide

### Basic Editing
1. **Paste JSON** directly into the left pane (CodeMirror editor)
2. **Upload a file** using the Upload button in the header
3. **View structure** in the right pane (tree view)
4. **Edit text** in the left pane - tree updates automatically

### Auto-Repair Malformed JSON
1. Paste invalid JSON (e.g., with trailing commas)
2. Error banner appears at bottom with error details
3. Click **Auto-Repair** button in toolbar or error banner
4. Review the diff in preview modal
5. Click **Accept** to apply or **Cancel** to discard

Example:
```json
// Before (invalid)
{
  "name": "John",
  "age": 30,
}

// After auto-repair (valid)
{
  "name": "John",
  "age": 30
}
```

### Convert Case
1. Ensure JSON is valid
2. Click **Convert Case** button in toolbar
3. Select direction: `snake_case → camelCase` or `camelCase → snake_case`
4. Select depth: **Deep** (all levels) or **Shallow** (first level only)
5. Click **Convert** to preview
6. Review diff and click **Accept** to apply

Example:
```json
// Before (snake_case)
{
  "user_name": "Alice",
  "email_address": "alice@example.com"
}

// After (camelCase)
{
  "userName": "Alice",
  "emailAddress": "alice@example.com"
}
```

### Search JSON
1. Type search query in the search box (toolbar)
2. Matches highlight in yellow in tree view
3. Current match highlighted in darker yellow
4. Use arrow buttons or keyboard shortcuts to navigate:
   - `Enter` - Next match
   - `Shift+Enter` - Previous match
   - `Escape` - Clear search
5. Tree auto-scrolls and expands to show matches

### Copy JSONPath
1. Click any node in the tree view
2. JSONPath is copied to clipboard
3. Toast notification confirms
4. Example paths:
   - Root property: `$.name`
   - Array element: `$.users[0]`
   - Nested property: `$.users[0].address.city`

### Undo Changes
- Click **Undo** button to revert last mutation
- Only works for auto-repair and case conversion
- Does not undo manual text edits (use Cmd/Ctrl+Z in editor)
- Stores last 20 changes

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` (in search) | Next match |
| `Shift+Enter` (in search) | Previous match |
| `Escape` (in search) | Clear search |
| `Cmd/Ctrl+Z` (in editor) | Undo text edit |
| `Tab` | Navigate UI elements |

## Development

### Available Commands

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Run tests
npm test

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # App header with upload
│   ├── Toolbar.tsx     # Action buttons
│   ├── TextEditor.tsx  # CodeMirror wrapper
│   ├── TreeView.tsx    # Virtualized tree
│   ├── TreeNode.tsx    # Individual tree node
│   ├── SearchBar.tsx   # Search input with controls
│   ├── ErrorBanner.tsx # Bottom error display
│   ├── PreviewModal.tsx # Diff preview modal
│   └── CaseConversionDialog.tsx # Case conversion options
├── hooks/              # Custom React hooks
│   ├── useJsonEditor.ts       # Core JSON state management
│   ├── useTreeState.ts        # Tree expansion state
│   ├── useAutoRepair.ts       # Auto-repair logic
│   ├── useCaseConversion.ts   # Case conversion logic
│   └── useSearch.ts           # Search state
├── utils/              # Utility functions
│   ├── jsonPath.ts     # JSONPath generation
│   ├── caseConversion.ts # Case conversion helpers
│   └── treeFlattener.ts # JSON to tree nodes
├── types/              # TypeScript types
│   └── index.ts
├── App.tsx             # Main app component
├── App.css             # App styles
└── index.css           # Global styles + Tailwind

tests/
└── <component>.test.tsx # Component tests
```

## Technologies

- **React 19.2** - UI framework with React Compiler
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CodeMirror 6** - JSON text editor with syntax highlighting
- **@tanstack/react-virtual** - Virtualized tree rendering
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **jsonrepair** - JSON auto-repair
- **diff** - Side-by-side diff view
- **Vitest + React Testing Library** - Testing

## Performance

- **Virtualized rendering**: Renders only visible nodes, handles 100k+ nodes smoothly
- **Debounced parsing**: Prevents lag when editing large files
- **Memoized calculations**: Optimized re-renders for diff and tree generation
- **Client-side only**: No network calls, all processing in browser

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires modern browser with ES2020+ support.

## Known Limitations

- Maximum recommended file size: 50MB (browser memory limits)
- Very deep nesting (50+ levels) may impact performance
- No syntax validation beyond JSON parsing

## Troubleshooting

**Tree view is empty:**
- Check if JSON is valid in the text editor
- Look for error message in bottom banner
- Try auto-repair if JSON has syntax errors

**Large file is slow:**
- Files over 10MB may take a moment to parse (warning shown)
- Tree view uses virtualization to stay responsive
- Consider splitting very large files if possible

**Search not finding results:**
- Search is case-insensitive and searches both keys and values
- Make sure JSON is valid and parsed
- Check that tree nodes are expanded

## Contributing

This project uses:
- **Beads** for issue tracking (`bd` commands)
- **Conventional commits** for commit messages
- **No Co-Authored-By** lines in commits

See `CLAUDE.md` for development guidelines.

## License

[Add your license here]

## Acknowledgments

- [jsonrepair](https://github.com/josdejong/jsonrepair) by Jos de Jong
- [CodeMirror](https://codemirror.net/) by Marijn Haverbeke
- [shadcn/ui](https://ui.shadcn.com/) by shadcn
- [TanStack Virtual](https://tanstack.com/virtual) by Tanner Linsley
