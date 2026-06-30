import { useState, useRef } from 'react'
import markdownit from 'markdown-it'
import MarkdownParser from './MarkdownParser'
import { csvCallback } from './csvCallback'

const parser = new MarkdownParser(markdownit())
parser.AddMediaType('.csv', csvCallback)

const initialContent = `# Import experiments
## External picture

![MFF UK](https://www.mff.cuni.cz/modules/MatFyzWeb/design25/images/mff-uk-logo-en.svg)

## Local pictures

![SMF](logo_samotne.svg)

## Local custom file type

![cars](myCars.csv)`

function App() {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [renderedHtml, setRenderedHtml] = useState(() => parser.parse(initialContent))

    function handleRender() {
        const text = textareaRef.current?.value ?? ''
        setRenderedHtml(parser.parse(text))
    }

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', gap: '0.5rem' }}>
                <textarea
                    ref={textareaRef}
                    defaultValue={initialContent}
                    style={{ flex: 1, resize: 'none', fontFamily: 'monospace' }}
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
