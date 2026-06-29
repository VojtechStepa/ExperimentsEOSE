import { useEffect, useRef, useState } from 'react';
import { loadSlides, saveSlides } from './db';

const DEBOUNCE_MS = 800;

type SaveState = 'idle' | 'saving' | 'saved';

function App() {
    const [slides, setSlides] = useState<string[]>(['']);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Always holds the latest slides so the debounce callback saves current state.
    const slidesRef = useRef(slides);

    useEffect(() => {
        loadSlides().then((stored) => {
            if (stored !== null) {
                setSlides(stored);
                slidesRef.current = stored;
            }
        });
    }, []);

    function scheduleSave(nextSlides: string[]) {
        slidesRef.current = nextSlides;
        setSaveState('idle');
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            setSaveState('saving');
            await saveSlides(slidesRef.current);
            setSaveState('saved');
        }, DEBOUNCE_MS);
    }

    function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const next = slides.map((s, i) => (i === currentIndex ? e.target.value : s));
        setSlides(next);
        scheduleSave(next);
    }

    function handleAddSlide() {
        const next = [...slides];
        next.splice(currentIndex + 1, 0, '');
        setSlides(next);
        setCurrentIndex(currentIndex + 1);
        scheduleSave(next);
    }

    function handleDeleteSlide() {
        if (slides.length === 1) return;
        const next = slides.filter((_, i) => i !== currentIndex);
        const nextIndex = currentIndex >= next.length ? next.length - 1 : currentIndex;
        setSlides(next);
        setCurrentIndex(nextIndex);
        scheduleSave(next);
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
            <h1>Autosave demo</h1>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <select
                    value={currentIndex}
                    onChange={(e) => setCurrentIndex(Number(e.target.value))}
                    style={{ fontSize: '1rem', padding: '0.25rem 0.5rem' }}
                >
                    {slides.map((_, i) => (
                        <option key={i} value={i}>Slide {i + 1}</option>
                    ))}
                </select>
                <button onClick={handleAddSlide} style={{ fontSize: '1rem', padding: '0.25rem 0.75rem' }}>
                    + Add slide
                </button>
                <button
                    onClick={handleDeleteSlide}
                    disabled={slides.length === 1}
                    style={{ fontSize: '1rem', padding: '0.25rem 0.75rem' }}
                >
                    Delete slide
                </button>
            </div>
            <textarea
                value={slides[currentIndex]}
                onChange={handleTextChange}
                rows={12}
                style={{ width: '100%', boxSizing: 'border-box', fontSize: '1rem', padding: '0.5rem' }}
                placeholder="Start typing..."
            />
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
                {saveState === 'idle' && ' '}
                {saveState === 'saving' && 'Saving...'}
                {saveState === 'saved' && 'Saved.'}
            </div>
        </div>
    );
}

export default App;
