import { useState, useRef } from 'react'
import markdownit from 'markdown-it'
import MarkdownParser from './MarkdownParser'
import { csvCallback } from './csvCallback'

const parser = new MarkdownParser(markdownit())
parser.AddMediaType('.csv', csvCallback)

function App() {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [renderedHtml, setRenderedHtml] = useState('')

    function handleRender() {
        const text = textareaRef.current?.value ?? ''
        setRenderedHtml(parser.parse(text))
    }

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', gap: '0.5rem' }}>
                <textarea
                    ref={textareaRef}
                    style={{ flex: 1, resize: 'none', fontFamily: 'monospace' }}
                    placeholder="Enter markdown here..."
                />
                <button onClick={handleRender}>Render</button>
            </div>
            <div
                style={{ flex: 1, padding: '1rem', borderLeft: '1px solid #ccc', overflow: 'auto' }}
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
        </div>
    )
}

export default App
