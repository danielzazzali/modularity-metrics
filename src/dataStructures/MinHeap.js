/**
 * Class representing a MinHeap.
 * Maintains a binary heap where the node with the smallest 'id' is always at the root.
 */
class MinHeap {
    /**
     * Creates an instance of MinHeap.
     */
    constructor() {
        /**
         * Internal array to store heap elements.
         * @type {Array<Object>}
         */
        this.heap = [];
    }

    /**
     * Calculates the index of the parent node.
     * @param {number} i - Index of the current node.
     * @returns {number} Index of the parent node.
     */
    parent(i) {
        return Math.floor((i - 1) / 2);
    }

    /**
     * Calculates the index of the left child node.
     * @param {number} i - Index of the current node.
     * @returns {number} Index of the left child node.
     */
    left(i) {
        return 2 * i + 1;
    }

    /**
     * Calculates the index of the right child node.
     * @param {number} i - Index of the current node.
     * @returns {number} Index of the right child node.
     */
    right(i) {
        return 2 * i + 2;
    }

    /**
     * Swaps two nodes in the heap.
     * @param {number} i - Index of the first node.
     * @param {number} j - Index of the second node.
     */
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    /**
     * Inserts a new node into the heap.
     * @param {Object} node - The node to insert, must have an 'id' property.
     */
    push(node) {
        this.heap.push(node);
        let i = this.heap.length - 1;

        // Bubble up the new node to maintain heap property
        while (i > 0 && this.heap[i].id < this.heap[this.parent(i)].id) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }

    /**
     * Removes and returns the node with the smallest 'id'.
     * @returns {Object|null} The node with the smallest 'id', or null if the heap is empty.
     */
    pop() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const min = this.heap[0];
        this.heap[0] = this.heap.pop();

        // Restore heap property by bubbling down the new root
        this.heapifyDown(0);

        return min;
    }

    /**
     * Restores the heap property by bubbling down the node at index 'i'.
     * @param {number} i - Index of the node to bubble down.
     */
    heapifyDown(i) {
        let smallest = i;
        const left = this.left(i);
        const right = this.right(i);

        // Find the smallest among current node and its children
        if (left < this.heap.length && this.heap[left].id < this.heap[smallest].id) {
            smallest = left;
        }

        if (right < this.heap.length && this.heap[right].id < this.heap[smallest].id) {
            smallest = right;
        }

        // If the smallest is not the current node, swap and continue bubbling down
        if (smallest !== i) {
            this.swap(i, smallest);
            this.heapifyDown(smallest);
        }
    }
}