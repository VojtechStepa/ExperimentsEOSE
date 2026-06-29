import { useEffect, useRef, useState } from 'react';
import { loadSlides, saveSlides, addMedia, loadAllMedia, deleteMedia, type MediaRecord } from './db';

const DEBOUNCE_MS = 800;

type SaveState = 'idle' | 'saving' | 'saved';

function App() {
    const [slides, setSlides] = useState<string[]>(['']);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const [media, setMedia] = useState<MediaRecord[]>([]);
    const [storageEstimate, setStorageEstimate] = useState<{ usage: number; quota: number } | null>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const slidesRef = useRef(slides);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function refreshStorageEstimate() {
        const est = await navigator.storage.estimate();
        setStorageEstimate({ usage: est.usage ?? 0, quota: est.quota ?? 0 });
    }

    useEffect(() => {
        loadSlides().then((stored) => {
            if (stored !== null) {
                setSlides(stored);
                slidesRef.current = stored;
            }
        });
        loadAllMedia().then(setMedia);
        refreshStorageEstimate();
    }, []);

    function scheduleSave(nextSlides: string[]) {
        slidesRef.current = nextSlides;
        setSaveState('idle');
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            setSaveState('saving');
            try {
                await saveSlides(slidesRef.current);
                setSaveState('saved');
                refreshStorageEstimate();
            } catch (err) {
                setSaveState('idle');
                if (isQuotaError(err)) {
                    alert('Storage quota exceeded. Free up space by deleting media files.');
                } else {
                    throw err;
                }
            }
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

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        const est = await navigator.storage.estimate();
        const free = (est.quota ?? 0) - (est.usage ?? 0);
        if (file.size > free) {
            alert(
                `Not enough storage space.\n` +
                `File size: ${formatBytes(file.size)}\n` +
                `Available: ${formatBytes(free)}`
            );
            return;
        }

        try {
            await addMedia(file);
            setMedia(await loadAllMedia());
            refreshStorageEstimate();
        } catch (err) {
            if (isQuotaError(err)) {
                alert('Storage quota exceeded. Free up space by deleting media files.');
            } else {
                throw err;
            }
        }
    }

    async function handleDeleteMedia(id: number) {
        await deleteMedia(id);
        setMedia((prev) => prev.filter((m) => m.id !== id));
        refreshStorageEstimate();
    }

    function handleViewMedia(item: MediaRecord) {
        const url = URL.createObjectURL(item.blob);
        window.open(url, '_blank');
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

            <h2 style={{ marginTop: '2rem' }}>Media</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
                <thead>
                    <tr>
                        <th style={thStyle}>Filename</th>
                        <th style={thStyle}>File size</th>
                        <th style={thStyle}>View</th>
                        <th style={thStyle}>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {media.length === 0 ? (
                        <tr>
                            <td colSpan={4} style={{ ...tdStyle, color: '#888', textAlign: 'center' }}>
                                No files loaded
                            </td>
                        </tr>
                    ) : (
                        media.map((item) => (
                            <tr key={item.id}>
                                <td style={tdStyle}>{item.name}</td>
                                <td style={tdStyle}>{formatBytes(item.blob.size)}</td>
                                <td style={tdStyle}>
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); handleViewMedia(item); }}
                                    >
                                        View
                                    </a>
                                </td>
                                <td style={tdStyle}>
                                    <button onClick={() => handleDeleteMedia(item.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: '1rem', padding: '0.25rem 0.75rem' }}
            >
                Load file
            </button>

            <h2 style={{ marginTop: '2rem' }}>Summary</h2>
            <ul style={{ lineHeight: '1.8' }}>
                <li>Total IndexedDB usage: {storageEstimate ? formatBytes(storageEstimate.usage) : '…'}</li>
                <li>Presentation: {formatBytes(new TextEncoder().encode(JSON.stringify(slides)).length)}</li>
                <li>Media: {formatBytes(media.reduce((sum, m) => sum + m.blob.size, 0))}</li>
                <li>Free space: {storageEstimate ? formatBytes(storageEstimate.quota - storageEstimate.usage) : '…'}</li>
            </ul>
        </div>
    );
}

function isQuotaError(err: unknown): boolean {
    return err instanceof DOMException && err.name === 'QuotaExceededError';
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '0.4rem 0.6rem',
    borderBottom: '2px solid #ccc',
};

const tdStyle: React.CSSProperties = {
    padding: '0.4rem 0.6rem',
    borderBottom: '1px solid #eee',
};

export default App;
