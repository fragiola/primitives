/**
 * The tree of open overlays of a document (spec/README.md, "The nested overlay tree"). A layer's
 * parent is decided when it is pushed: the newest open layer that contains one of its owner
 * elements (the triggers it was opened from), else the newest that contains the focused element,
 * else none. So a trigger inside a portaled popup makes its overlay a child of that popup's
 * overlay, wherever the child's own portal sits in the DOM.
 *
 * - Escape closes the newest layer (with an `onEscape`) only;
 * - an outside press keeps the deepest layer that contains the press (its elements, or its
 *   `ignore` list: a press on an overlay's own trigger toggles it itself) and its ancestors, and
 *   dismisses every other open layer, newest first; a press outside every layer dismisses all;
 * - removing a layer re-parents its children to its parent, and tells each descendant still open
 *   that an ancestor closed (`onParentClose`), newest first.
 */
type Elements = () => readonly (Element | null | undefined)[];

export interface LayerOptions {
    /** The elements that make up the layer (its popup, positioner). */
    elements: Elements;
    /** Elements a press on does not dismiss the layer (its trigger, which toggles it itself). */
    ignore?: Elements;
    /**
     * Elements that cover the page under the layer (a dialog's backdrop and viewport): a press on
     * one is outside this layer, but inside its parent.
     */
    backdrops?: Elements;
    /** The elements the overlay was opened from (its triggers), which decide its parent. */
    owner?: Elements;
    onEscape?: (event: KeyboardEvent) => void;
    onOutsidePress?: (event: PointerEvent) => void;
    /** An ancestor layer was removed while this one is still open. */
    onParentClose?: () => void;
}

export interface Layer {
    /** Whether the layer is the newest open layer of its document. */
    isTop: () => boolean;
    /** The elements of the layer's descendants (its child layers, recursively). */
    elementsAbove: () => Element[];
    remove: () => void;
}

interface LayerNode {
    options: LayerOptions;
    parent: LayerNode | null;
}

interface Tree {
    /** Every open layer, oldest first. */
    nodes: LayerNode[];
    teardown: () => void;
}

const trees = new WeakMap<Document, Tree>();

function contains(list: Elements | undefined, target: unknown): boolean {
    return (
        list !== undefined &&
        target instanceof Node &&
        list().some((element) => element?.contains(target) === true)
    );
}

function depth(node: LayerNode): number {
    let count = 0;
    for (let at = node.parent; at !== null; at = at.parent) {
        count += 1;
    }
    return count;
}

function isAncestorOrSelf(
    candidate: LayerNode,
    node: LayerNode | null,
): boolean {
    for (let at = node; at !== null; at = at.parent) {
        if (at === candidate) {
            return true;
        }
    }
    return false;
}

/** The deepest layer a press on `target` is inside of (null: outside every layer). */
function layerOfPress(
    tree: Tree,
    target: EventTarget | null,
): LayerNode | null {
    let found: LayerNode | null = null;
    let foundDepth = -1;
    const consider = (node: LayerNode | null) => {
        if (node === null) {
            return;
        }
        const nodeDepth = depth(node);
        // the newest wins a tie: the nodes are walked oldest first
        if (nodeDepth >= foundDepth) {
            found = node;
            foundDepth = nodeDepth;
        }
    };
    for (const node of tree.nodes) {
        if (
            contains(node.options.elements, target) ||
            contains(node.options.ignore, target)
        ) {
            consider(node);
        } else if (contains(node.options.backdrops, target)) {
            // a press on a layer's backdrop is outside it, inside its parent
            consider(node.parent);
        }
    }
    return found;
}

function createTree(doc: Document): Tree {
    const tree: Tree = { nodes: [], teardown: () => {} };
    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Escape" || event.defaultPrevented) {
            return;
        }
        const top = tree.nodes.at(-1);
        if (top?.options.onEscape) {
            event.preventDefault();
            event.stopPropagation();
            top.options.onEscape(event);
        }
    };
    const onPointerDown = (event: PointerEvent) => {
        const inside = layerOfPress(tree, event.target);
        for (const node of [...tree.nodes].reverse()) {
            if (!isAncestorOrSelf(node, inside)) {
                node.options.onOutsidePress?.(event);
            }
        }
    };
    doc.addEventListener("keydown", onKeyDown, true);
    doc.addEventListener("pointerdown", onPointerDown, true);
    tree.teardown = () => {
        doc.removeEventListener("keydown", onKeyDown, true);
        doc.removeEventListener("pointerdown", onPointerDown, true);
    };
    return tree;
}

/** The newest open layer that contains one of `elements`. */
function newestContaining(
    tree: Tree,
    elements: readonly (Element | null | undefined)[],
): LayerNode | null {
    for (const node of [...tree.nodes].reverse()) {
        const own = node.options.elements();
        if (
            elements.some(
                (element) =>
                    element != null &&
                    own.some((part) => part?.contains(element) === true),
            )
        ) {
            return node;
        }
    }
    return null;
}

function descendants(tree: Tree, node: LayerNode): LayerNode[] {
    return tree.nodes.filter(
        (candidate) =>
            candidate !== node && isAncestorOrSelf(node, candidate.parent),
    );
}

/** Pushes a layer on its document's tree; `remove` takes it out (in any order). */
export function pushLayer(doc: Document, options: LayerOptions): Layer {
    let tree = trees.get(doc);
    if (tree === undefined) {
        tree = createTree(doc);
        trees.set(doc, tree);
    }
    const current = tree;
    const parent =
        newestContaining(current, options.owner?.() ?? []) ??
        newestContaining(current, [doc.activeElement]);
    const node: LayerNode = { options, parent };
    current.nodes.push(node);
    let removed = false;
    return {
        isTop: () => current.nodes.at(-1) === node,
        elementsAbove: () =>
            descendants(current, node)
                .flatMap((child) => child.options.elements())
                .filter((element): element is Element => element != null),
        remove: () => {
            if (removed) {
                return;
            }
            removed = true;
            const below = descendants(current, node);
            const index = current.nodes.indexOf(node);
            if (index !== -1) {
                current.nodes.splice(index, 1);
            }
            for (const child of current.nodes) {
                if (child.parent === node) {
                    child.parent = node.parent;
                }
            }
            if (current.nodes.length === 0) {
                current.teardown();
                trees.delete(doc);
            }
            // closing an overlay closes the overlays opened from it, newest first
            for (const child of below.reverse()) {
                if (current.nodes.includes(child)) {
                    child.options.onParentClose?.();
                }
            }
        },
    };
}
