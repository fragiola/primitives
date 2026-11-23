import { edgeIndex, stepIndex } from "./list-navigation.ts";

/** The axis a roving composite's arrows move along (spec/toolbar.md, "Keyboard"). */
export type RovingOrientation = "horizontal" | "vertical";

/** The keys that move to a roving composite's next and previous item. */
export interface RovingKeys {
    next: string;
    previous: string;
}

export interface RovingKeyOptions {
    orientation: RovingOrientation;
    rtl: boolean;
    /** Wrap from the last item to the first, and back (`loopFocus`). */
    loop: boolean;
    /** The items the keys pass over: the ones that cannot take focus (default: none). */
    skip?: (index: number) => boolean;
}

/**
 * The arrows of a roving composite (a toolbar, a toggle group, a menu bar; spec/toolbar.md,
 * "Keyboard"): ArrowRight and ArrowLeft when horizontal (mirrored in RTL), ArrowDown and ArrowUp
 * when vertical. A menu bar reads them to tell an arrow that moves to the neighbouring item.
 */
export function rovingKeys(
    orientation: RovingOrientation,
    rtl: boolean,
): RovingKeys {
    if (orientation === "vertical") {
        return { next: "ArrowDown", previous: "ArrowUp" };
    }
    return rtl
        ? { next: "ArrowLeft", previous: "ArrowRight" }
        : { next: "ArrowRight", previous: "ArrowLeft" };
}

/**
 * The item a key moves focus to in a roving composite of `count` items (spec/toolbar.md,
 * spec/toggle-group.md, "Keyboard"): the next and previous arrows of the orientation (mirrored in
 * RTL), passing over skipped items and wrapping with `loop` (without it, an arrow at an end gives
 * `index` back); Home and End the first and last item not skipped. From no item (`index` -1), the
 * next arrow gives the first item and the previous one the last. `null` when the key is none of
 * these (the other orientation's arrows included), or when every item is skipped.
 */
export function rovingKeyTarget(
    key: string,
    index: number,
    count: number,
    options: RovingKeyOptions,
): number | null {
    const { next, previous } = rovingKeys(options.orientation, options.rtl);
    const skip = options.skip ?? (() => false);
    let target: number;
    if (key === next || key === previous) {
        target = stepIndex(count, index, key === next ? 1 : -1, {
            loop: options.loop,
            skip,
        });
        // a skipped item never gets the focus back, even when there is nowhere to go
        if (target !== -1 && skip(target)) {
            return null;
        }
    } else if (key === "Home" || key === "End") {
        target = edgeIndex(count, key === "Home" ? "first" : "last", skip);
    } else {
        return null;
    }
    return target === -1 ? null : target;
}

/**
 * The item that holds a roving composite's tab stop (`tabindex="0"`, spec/toolbar.md, "Focus"):
 * `preferred` (the item that last had focus) while it is in range and not skipped, else the first
 * item not skipped; -1 when every item is skipped (the composite is then no tab stop).
 */
export function rovingTabStop(
    count: number,
    preferred: number,
    skip: (index: number) => boolean = () => false,
): number {
    if (preferred >= 0 && preferred < count && !skip(preferred)) {
        return preferred;
    }
    return edgeIndex(count, "first", skip);
}

/** The `<input>` types whose caret the arrow keys move (they have a text selection). */
const TEXT_TYPES: readonly string[] = [
    "",
    "text",
    "search",
    "url",
    "tel",
    "password",
];

interface TextField extends Element {
    readonly value: string;
    readonly selectionStart: number | null;
    readonly selectionEnd: number | null;
    readonly disabled: boolean;
    readonly type: string;
}

/** An enabled text field: a `<textarea>`, or an `<input>` of a text type, not `aria-disabled`. */
function textField(element: Element): TextField | null {
    const tag = element.tagName;
    if (tag !== "INPUT" && tag !== "TEXTAREA") {
        return null;
    }
    const field = element as TextField;
    if (
        field.disabled ||
        element.getAttribute("aria-disabled") === "true" ||
        (tag === "INPUT" && !TEXT_TYPES.includes(field.type))
    ) {
        return null;
    }
    return field;
}

/**
 * Whether a text field keeps a key a roving composite would act on (spec/toolbar.md, "A
 * Toolbar.Input keeps its text keys", Base UI): while text is selected, every key; with a
 * collapsed caret, the next arrow unless the caret is at the end, the previous arrow unless it is
 * at the start, Home and End unless the text is empty. `false` for an element that is no enabled
 * text field, and for any other key (the composite does not act on it anyway).
 */
export function textFieldKeepsKey(
    element: Element,
    key: string,
    keys: RovingKeys,
): boolean {
    const field = textField(element);
    if (field === null) {
        return false;
    }
    const handled =
        key === keys.next ||
        key === keys.previous ||
        key === "Home" ||
        key === "End";
    if (!handled) {
        return false;
    }
    const start = field.selectionStart;
    const end = field.selectionEnd;
    // no selection to read (an input type without one): the field keeps its keys
    if (start === null || end === null || start !== end) {
        return true;
    }
    const length = field.value.length;
    if (key === keys.next) {
        return start < length;
    }
    if (key === keys.previous) {
        return start > 0;
    }
    return length > 0;
}

/**
 * The entries in their elements' document order (a roving composite's items registered in any
 * order: spec/toolbar.md, "Nested composites"). The order is taken in one tree: the document's
 * when an element is connected, else the first element's; the entries whose element is in another
 * tree (disconnected) come last, in their relative order.
 */
export function inDocumentOrder<Entry>(
    entries: readonly Entry[],
    element: (entry: Entry) => Node,
): Entry[] {
    const first =
        entries.find((entry) => element(entry).isConnected) ?? entries[0];
    if (first === undefined) {
        return [];
    }
    const tree = element(first).getRootNode();
    const inTree: Entry[] = [];
    const elsewhere: Entry[] = [];
    for (const entry of entries) {
        (element(entry).getRootNode() === tree ? inTree : elsewhere).push(
            entry,
        );
    }
    // within one tree, every two nodes are ordered: a consistent comparator
    inTree.sort((a, b) => {
        const left = element(a);
        const right = element(b);
        if (left === right) {
            return 0;
        }
        return left.compareDocumentPosition(right) &
            Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1;
    });
    return [...inTree, ...elsewhere];
}
