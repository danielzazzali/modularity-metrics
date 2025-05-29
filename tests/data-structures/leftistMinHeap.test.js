import { describe, it, expect } from '@jest/globals';
import {
    makeNode,
    rank,
    merge,
    insert,
    findMin,
    deleteMin,
    isEmpty,
    empty
} from '../../src/data-structures/leftistMinHeap.js';


describe('Leftist Heap Implementation', () => {
    describe('makeNode', () => {
        it('creates a leaf node with correct properties', () => {
            const value = { state: { id: 5, name: 'Alice' } };
            const node = makeNode(value);

            expect(node.value).toBe(value);
            expect(node.left).toBeNull();
            expect(node.right).toBeNull();
            expect(node.rank).toBe(1);
        });

        it('allows custom left, right, and rank parameters', () => {
            const left = makeNode({ state: { id: 1 } });
            const right = makeNode({ state: { id: 2 } });
            const node = makeNode({ state: { id: 3 } }, left, right, 7);

            expect(node.left).toBe(left);
            expect(node.right).toBe(right);
            expect(node.rank).toBe(7);
        });
    });

    describe('rank', () => {
        it('returns 0 for null heap', () => {
            expect(rank(null)).toBe(0);
            expect(rank(empty)).toBe(0);
        });

        it("returns the node's rank for non-null heap", () => {
            const node = makeNode({ state: { id: 10 } }, null, null, 4);
            expect(rank(node)).toBe(4);
        });
    });

    describe('isEmpty', () => {
        it('identifies empty heap correctly', () => {
            expect(isEmpty(null)).toBe(true);
            expect(isEmpty(empty)).toBe(true);
        });

        it('identifies non-empty heap correctly', () => {
            const node = makeNode({ state: { id: 1 } });
            expect(isEmpty(node)).toBe(false);
        });
    });

    describe('findMin', () => {
        it('returns null for empty heap', () => {
            expect(findMin(null)).toBeNull();
        });

        it('returns the value of the root node', () => {
            const value = { state: { id: 42 } };
            const node = makeNode(value);
            expect(findMin(node)).toBe(value);
        });
    });

    describe('merge', () => {
        it('returns the other heap when merging with null', () => {
            const h1 = makeNode({ state: { id: 3 } });
            expect(merge(null, h1)).toBe(h1);
            expect(merge(h1, null)).toBe(h1);
        });

        it('maintains the smaller root as new root', () => {
            const a = makeNode({ state: { id: 2 } });
            const b = makeNode({ state: { id: 7 } });
            const merged = merge(a, b);
            expect(findMin(merged).state.id).toBe(2);

            const swapped = merge(b, a);
            expect(findMin(swapped).state.id).toBe(2);
        });

        it('merges multiple elements preserving min-heap order', () => {
            const values = [5, 1, 3, 4, 2];
            let h = null;
            for (const id of values) {
                h = merge(h, makeNode({ state: { id } }));
            }

            // Extract all elements by successive deleteMin
            const extracted = [];
            while (!isEmpty(h)) {
                const minVal = findMin(h).state.id;
                extracted.push(minVal);
                h = deleteMin(h);
            }

            expect(extracted).toEqual([1, 2, 3, 4, 5]);
        });
    });

    describe('insert and deleteMin', () => {
        it('inserts elements correctly and findMin returns the smallest', () => {
            let h = empty;
            h = insert({ state: { id: 10 } }, h);
            expect(findMin(h).state.id).toBe(10);
            h = insert({ state: { id: 5 } }, h);
            expect(findMin(h).state.id).toBe(5);
            h = insert({ state: { id: 8 } }, h);
            expect(findMin(h).state.id).toBe(5);
        });

        it('deleteMin removes the smallest and restructures the heap', () => {
            let h = empty;
            [4, 1, 7, 3].forEach(id => {
                h = insert({ state: { id } }, h);
            });

            expect(findMin(h).state.id).toBe(1);
            h = deleteMin(h);
            expect(findMin(h).state.id).toBe(3);
            h = deleteMin(h);
            expect(findMin(h).state.id).toBe(4);
            h = deleteMin(h);
            expect(findMin(h).state.id).toBe(7);
            h = deleteMin(h);
            expect(findMin(h)).toBeNull();
        });
    });
});
