import { useEffect, useRef, useState } from 'react';
import { loadText, saveText } from './db';

const DEBOUNCE_MS = 800;

type SaveState = 'idle' | 'saving' | 'saved';

function App() {
    const [text, setText] = useState('');
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        loadText().then((stored) => {
            if (stored !== null) setText(stored);
        });
    }, []);

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const value = e.target.value;
        setText(value);
        setSaveState('idle');

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            setSaveState('saving');
            await saveText(value);
            setSaveState('saved');
        }, DEBOUNCE_MS);
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
            <h1>Autosave demo</h1>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>
                Content is saved to IndexedDB after you stop typing.
            </p>
            <textarea
                value={text}
                onChange={handleChange}
                rows={12}
                style={{ width: '100%', boxSizing: 'border-box', fontSize: '1rem', padding: '0.5rem' }}
                placeholder="Start typing..."
            />
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
                {saveState === 'idle' && ' '}
                {saveState === 'saving' && 'Saving...'}
                {saveState === 'saved' && 'Saved.'}
            </div>
        </div>
    );
}

export default App;
