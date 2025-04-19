/**
 * @typedef {Object} Node
 * @property {Object} value             - Stored object; comparison is by `value.id`.
 * @property {Node|null} left           - Left sub‑heap or null if empty.
 * @property {Node|null} right          - Right sub‑heap or null if empty.
 * @property {number} rank              - Null‑path length (distance to nearest null child).
 */


/**
 * Factory to create a new heap node.
 *
 * @param {Object} value                - Must include a numeric or comparable `id` property.
 * @param {Node|null} [left=null]       - Left child heap.
 * @param {Node|null} [right=null]      - Right child heap.
 * @param {number} [rank=1]             - Rank (null‑path length); defaults to 1 for a leaf.
 * @returns {Node}                      - New immutable heap node.
 *
 * @example
 * // Creates a leaf node wrapping { id: 5, name: 'Alice' }
 * const leaf = makeNode({ id: 5, name: 'Alice' });
 */
const makeNode = (value, left = null, right = null, rank = 1) =>
    ({ value, left, right, rank });


/**
 * Retrieve the rank (null‑path length) of a heap.
 *
 * @param {Node|null} h                 - Heap to inspect.
 * @returns {number}                    - 0 if `h` is null; otherwise `h.rank`.
 *
 * @example
 * rank(null);    // ⇒ 0
 * rank(makeNode({id:1})); // ⇒ 1
 */
const rank = (h) => (h === null ? 0 : h.rank);


/**
 * Merge (meld) two leftist heaps into one.
 *
 * @param {Node|null} h1                - First heap.
 * @param {Node|null} h2                - Second heap.
 * @returns {Node|null}                 - New heap containing all elements.
 *
 * @complexity O(log(n)) on the size of the resulting heap.
 *
 * @example
 * // Merging two single‑node heaps:
 * const a = makeNode({ id: 2 });
 * const b = makeNode({ id: 7 });
 * const merged = merge(a, b);
 * console.log(findMin(merged).id); // ⇒ 2
 */
const merge = (h1, h2) => {
    if (h1 === null) return h2;
    if (h2 === null) return h1;

    // Ensure the smaller root by comparing `id` properties
    if (h1.value.id > h2.value.id) return merge(h2, h1);

    // Recursively merge h2 into h1’s right subtree
    const mergedRight = merge(h1.right, h2);

    // Enforce leftist property: rank(left) ≥ rank(right)
    let left = h1.left, right = mergedRight;
    if (rank(left) < rank(right)) [left, right] = [right, left];

    // Return new root with updated rank
    return makeNode(h1.value, left, right, 1 + rank(right));
};


/** @type {null} */
const empty = null;


/**
 * Insert a new element into the heap.
 *
 * @param {Object} x                    - Object with an `id` property.
 * @param {Node|null} h                 - Original heap.
 * @returns {Node}                      - New heap including `x`.
 *
 * @complexity O(log(n))
 *
 * @example
 * const h = insert({ id: 3 }, empty);
 * console.log(findMin(h).id); // ⇒ 3
 */
const insert = (x, h) => merge(makeNode(x), h);


/**
 * Retrieve the minimum element (by `id`) without modifying the heap.
 *
 * @param {Node|null} h                 - Heap to inspect.
 * @returns {Object|null}               - The stored object with smallest `id`, or null if empty.
 *
 * @complexity O(1)
 *
 * @example
 * findMin(null); // ⇒ null
 */
const findMin = (h) => (h === null ? null : h.value);


/**
 * Remove the minimum element and return the resulting heap.
 *
 * @param {Node|null} h                 - Heap to remove from.
 * @returns {Node|null}                 - New heap after deleting min, or null if empty.
 *
 * @complexity O(log(n))
 *
 * @example
 * let h = insert({ id: 1 }, empty);
 * h = insert({ id: 4 }, h);
 * h = deleteMin(h);
 * console.log(findMin(h).id); // ⇒ 4
 */
const deleteMin = (h) => (h === null ? null : merge(h.left, h.right));


export { makeNode, rank, merge, insert, findMin, deleteMin, empty };