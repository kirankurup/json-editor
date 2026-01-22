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
