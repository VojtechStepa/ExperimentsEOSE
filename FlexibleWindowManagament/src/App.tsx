import { useCallback, useMemo, useState } from 'react';
import './App.css';
import { PaneNode } from './PaneNode';
import type { PaneHandler } from './PaneNode';
import { Tree } from './tree';

export function App() {
    const [tree, setTree] = useState<Tree>(Tree.create);

    const canDelete = tree.root.state !== 'leaf';

    const onSplitH = useCallback((id: number) => {
        setTree(t => t.splitLeafHorizontally(id));
    }, []);

    const onSplitV = useCallback((id: number) => {
        setTree(t => t.splitLeafVertically(id));
    }, []);

    const onRemove = useCallback((id: number) => {
        setTree(t => t.removeLeaf(id));
    }, []);

    const handlers = useMemo<PaneHandler>(
        () => ({onSplitH, onSplitV, onRemove, canDelete}),
        [onSplitH, onSplitV, onRemove, canDelete],
    );

    return (
        <div style={{height: '100%'}}>
            <PaneNode node={tree.root} handlers={handlers} />
        </div>
    );
}

export default App;
