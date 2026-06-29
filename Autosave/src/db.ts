const DB_NAME = 'autosave-demo';
const CONTENT_STORE = 'content';
const MEDIA_STORE = 'media';
const SLIDES_KEY = 'slides';

export type MediaRecord = {
    id: number;
    name: string;
    type: string;
    blob: Blob;
};

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 2);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(CONTENT_STORE)) {
                db.createObjectStore(CONTENT_STORE);
            }
            if (!db.objectStoreNames.contains(MEDIA_STORE)) {
                db.createObjectStore(MEDIA_STORE, { autoIncrement: true });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function loadSlides(): Promise<string[] | null> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(CONTENT_STORE, 'readonly');
        const req = tx.objectStore(CONTENT_STORE).get(SLIDES_KEY);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
    });
}

export async function saveSlides(slides: string[]): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(CONTENT_STORE, 'readwrite');
        tx.objectStore(CONTENT_STORE).put(slides, SLIDES_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function addMedia(file: File): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(MEDIA_STORE, 'readwrite');
        tx.objectStore(MEDIA_STORE).add({ name: file.name, type: file.type, blob: file });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function loadAllMedia(): Promise<MediaRecord[]> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(MEDIA_STORE, 'readonly');
        const req = tx.objectStore(MEDIA_STORE).openCursor();
        const items: MediaRecord[] = [];
        req.onsuccess = () => {
            const cursor = req.result;
            if (cursor) {
                items.push({ id: cursor.key as number, ...cursor.value });
                cursor.continue();
            } else {
                resolve(items);
            }
        };
        req.onerror = () => reject(req.error);
    });
}

export async function deleteMedia(id: number): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(MEDIA_STORE, 'readwrite');
        tx.objectStore(MEDIA_STORE).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}
