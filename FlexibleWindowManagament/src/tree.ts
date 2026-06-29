export type NodeState = 'horizontalSplit' | 'verticalSplit' | 'leaf';

export interface Node {
    id: number;
    state: NodeState;
    left?: Node;
    right?: Node;
}

export class Tree {
    readonly root: Node;
    private readonly nextId: number;

    private constructor(root: Node, nextId: number) {
        this.root = root;
        this.nextId = nextId;
    }

    static create(): Tree {
        return new Tree({id: 1, state: 'leaf'}, 2);
    }

    private findAndSplit(
        id: number,
        node: Node,
        direction: 'horizontalSplit' | 'verticalSplit',
        nextId: number,
    ): {node: Node; nextId: number} | null {
        if (node.id === id) {
            if (node.state !== 'leaf') throw new Error(`Node ${id} is not a leaf`);
            return {
                node: {
                    id: node.id,
                    state: direction,
                    left: {id: nextId, state: 'leaf'},
                    right: {id: nextId + 1, state: 'leaf'},
                },
                nextId: nextId + 2,
            };
        }
        if (node.state === 'leaf') return null;

        const leftResult = this.findAndSplit(id, node.left!, direction, nextId);
        if (leftResult !== null) return {node: {...node, left: leftResult.node}, nextId: leftResult.nextId};

        const rightResult = this.findAndSplit(id, node.right!, direction, nextId);
        if (rightResult !== null) return {node: {...node, right: rightResult.node}, nextId: rightResult.nextId};

        return null;
    }

    splitLeafHorizontally(id: number): Tree {
        const result = this.findAndSplit(id, this.root, 'horizontalSplit', this.nextId);
        if (result === null) throw new Error(`Node ${id} not found in tree`);
        return new Tree(result.node, result.nextId);
    }

    splitLeafVertically(id: number): Tree {
        const result = this.findAndSplit(id, this.root, 'verticalSplit', this.nextId);
        if (result === null) throw new Error(`Node ${id} not found in tree`);
        return new Tree(result.node, result.nextId);
    }

    private removeLeafFromSubtree(id: number, node: Node): Node | null {
        if (node.state === 'leaf') return null;

        if (node.left!.id === id) {
            if (node.left!.state !== 'leaf') throw new Error(`Node ${id} is not a leaf`);
            return node.right!;
        }
        if (node.right!.id === id) {
            if (node.right!.state !== 'leaf') throw new Error(`Node ${id} is not a leaf`);
            return node.left!;
        }

        const newLeft = this.removeLeafFromSubtree(id, node.left!);
        if (newLeft !== null) return {...node, left: newLeft};

        const newRight = this.removeLeafFromSubtree(id, node.right!);
        if (newRight !== null) return {...node, right: newRight};

        return null;
    }

    removeLeaf(id: number): Tree {
        if (this.root.state === 'leaf') {
            throw new Error('Cannot remove the only node in the tree');
        }
        const result = this.removeLeafFromSubtree(id, this.root);
        if (result === null) throw new Error(`Node ${id} not found in tree`);
        return new Tree(result, this.nextId);
    }
}
