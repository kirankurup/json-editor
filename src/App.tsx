import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          JSON Viewer & Editor
        </h1>
        <p className="text-gray-600 mb-8">
          Project setup complete! Count: {count}
        </p>
        <button
          onClick={() => setCount((count) => count + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Click me
        </button>
      </div>
    </div>
  )
}

export default App
