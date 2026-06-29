import { memo } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import type { Node } from './tree';

export interface PaneHandler {
    onSplitH: (id: number) => void;
    onSplitV: (id: number) => void;
    onRemove: (id: number) => void;
    canDelete: boolean;
}

interface PaneNodeProps {
    node: Node;
    handlers: PaneHandler;
}

export const PaneNode = memo(function PaneNode({ node, handlers }: PaneNodeProps) {
    if (node.state === 'leaf') {
        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 8, boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                    <button onClick={() => handlers.onSplitH(node.id)}>Split H</button>
                    <button onClick={() => handlers.onSplitV(node.id)}>Split V</button>
                    <button disabled={!handlers.canDelete} onClick={() => handlers.onRemove(node.id)}>
                        Delete
                    </button>
                </div>
                <div style={{ color: '#64748b', fontSize: 12 }}>pane {node.id}</div>
            </div>
        );
    }

    const orientation = node.state === 'horizontalSplit' ? 'horizontal' : 'vertical';
    const separatorClass =
        orientation === 'horizontal' ? 'resize-handle is-horizontal' : 'resize-handle is-vertical';

    return (
        <Group id={String(node.id)} orientation={orientation} style={{ height: '100%' }}>
            <Panel id={String(node.left!.id)} key={node.left!.id} minSize={10}>
                <PaneNode node={node.left!} handlers={handlers} />
            </Panel>
            <Separator className={separatorClass} />
            <Panel id={String(node.right!.id)} key={node.right!.id} minSize={10}>
                <PaneNode node={node.right!} handlers={handlers} />
            </Panel>
        </Group>
    );
});
