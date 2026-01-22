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
