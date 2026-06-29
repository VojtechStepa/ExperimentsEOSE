let nextId = 1;
function newId(): string {
    return String(nextId++);
}

export type NodeState = 'horizontalSplit' | 'verticalSplit' | 'leaf';

export interface Node {
    id: string;
    state: NodeState;
    left?: Node;
    right?: Node;
}

export function createInitialTree(): Node {
    return {id: newId(), state: 'leaf'};
}

function findAndSplit(
    id: string,
    tree: Node,
    direction: 'horizontalSplit' | 'verticalSplit',
): Node | null {
    if (tree.id === id) {
        if (tree.state !== 'leaf') throw new Error(`Node ${id} is not a leaf`);
        return {
            id: tree.id,
            state: direction,
            left: {id: newId(), state: 'leaf'},
            right: {id: newId(), state: 'leaf'},
        };
    }
    if (tree.state === 'leaf') return null;

    const newLeft = findAndSplit(id, tree.left!, direction);
    if (newLeft !== null) return {...tree, left: newLeft};

    const newRight = findAndSplit(id, tree.right!, direction);
    if (newRight !== null) return {...tree, right: newRight};

    return null;
}

export function SplitLeafHorizontally(id: string, tree: Node): Node {
    const result = findAndSplit(id, tree, 'horizontalSplit');
    if (result === null) throw new Error(`Node ${id} not found in tree`);
    return result;
}

export function SplitLeafVertically(id: string, tree: Node): Node {
    const result = findAndSplit(id, tree, 'verticalSplit');
    if (result === null) throw new Error(`Node ${id} not found in tree`);
    return result;
}

function removeLeafFromSubtree(id: string, tree: Node): Node | null {
    if (tree.state === 'leaf') return null;

    if (tree.left!.id === id) {
        if (tree.left!.state !== 'leaf') throw new Error(`Node ${id} is not a leaf`);
        return tree.right!;
    }
    if (tree.right!.id === id) {
        if (tree.right!.state !== 'leaf') throw new Error(`Node ${id} is not a leaf`);
        return tree.left!;
    }

    const newLeft = removeLeafFromSubtree(id, tree.left!);
    if (newLeft !== null) return {...tree, left: newLeft};

    const newRight = removeLeafFromSubtree(id, tree.right!);
    if (newRight !== null) return {...tree, right: newRight};

    return null;
}

export function RemoveLeaf(id: string, tree: Node): Node {
    if (tree.state === 'leaf') {
        throw new Error('Cannot remove the only node in the tree');
    }
    const result = removeLeafFromSubtree(id, tree);
    if (result === null) throw new Error(`Node ${id} not found in tree`);
    return result;
}
