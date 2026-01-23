# JSON Viewer & Editor

UI-first JSON viewer and editor with auto-repair, case conversion, search, and navigation.

## Features

### Core Capabilities

- **Two-Pane Layout**: Input/edit on the left, tree visualization on the right
- **Auto-Repair**: Fix common JSON errors (missing commas, quotes) with preview and confirmation
- **Case Conversion**: Convert between snake_case ↔ camelCase for keys (with preview and undo)
- **Path Copy**: Click any node to copy its JSONPath
- **Search & Navigate**: Plain-text search across keys and values with result highlighting
- **Large File Support**: Virtualized tree rendering handles ≥5MB files or ≥100k nodes

### Technical Highlights

- **Local-First**: All processing happens in-browser; no network calls
- **Safe Operations**: Preview all changes before applying; undo support
- **Accessible**: Keyboard navigation, ARIA roles, high contrast support
- **Fast**: Virtualized rendering keeps UI responsive even with massive JSON

## Tech Stack

- **Frontend**: TypeScript, React 19.2 (with React Compiler)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Libraries**:
  - `@tanstack/react-virtual` - Virtualized tree rendering
  - `jsonrepair` - Safe auto-repair for malformed JSON

## Quick Start

### Prerequisites

- Node.js 18+ and npm

Always shows a diff preview before applying changes.


