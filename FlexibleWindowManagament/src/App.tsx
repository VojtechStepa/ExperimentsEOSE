import { useCallback, useMemo, useState } from 'react';
import './App.css';
import { PaneNode } from './PaneNode';
import type { PaneHandler } from './PaneNode';
import { createInitialTree, RemoveLeaf, SplitLeafHorizontally, SplitLeafVertically } from './tree';
import type { Node } from './tree';

export function App() {
    const [tree, setTree] = useState<Node>(createInitialTree);

    const canDelete = tree.state !== 'leaf';

    const onSplitH = useCallback((id: string) => {
        setTree(t => SplitLeafHorizontally(id, t));
    }, []);

    const onSplitV = useCallback((id: string) => {
        setTree(t => SplitLeafVertically(id, t));
    }, []);

    const onRemove = useCallback((id: string) => {
        setTree(t => RemoveLeaf(id, t));
    }, []);

    const handlers = useMemo<PaneHandler>(
        () => ({ onSplitH, onSplitV, onRemove, canDelete }),
        [onSplitH, onSplitV, onRemove, canDelete],
    );

    return (
        <div style={{ height: '100%' }}>
            <PaneNode node={tree} handlers={handlers} />
        </div>
    );
}

export default App;
