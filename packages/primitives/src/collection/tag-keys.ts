import { rovingKeyTarget } from "./roving-focus.ts";

/** The keys of a key event that matter to the tag key maps (a `KeyboardEvent`, or a framework's). */
export interface TagKeyEvent {
    key: string;
    shiftKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    altKey: boolean;
}

/** What a key on a TagGroup's focused tag does (spec/tag-group.md, "Keyboard"). */
export type TagGroupKeyAction =
    | { type: "focus"; index: number }
    | { type: "select" }
    | { type: "remove" };

export interface TagGroupKeyOptions {
    rtl: boolean;
    /** Wrap from the last tag to the first, and back (`loopFocus`). */
    loop: boolean;
    /** The tags the keys pass over: the disabled ones (default: none). */
    skip?: (index: number) => boolean;
    /** Space and Enter select (a `selectionMode` other than `"none"`). */
    selectable: boolean;
    /** Delete and Backspace remove (the group has `onRemove`). */
    removable: boolean;
}

/**
 * The action of a key on the tag at `index` of a TagGroup's `count` tags (spec/tag-group.md,
 * "Keyboard"), or `null` for a key it leaves alone: the next tag is ArrowRight (ArrowLeft in RTL)
 * and ArrowDown, the previous one ArrowLeft (ArrowRight in RTL) and ArrowUp, passing over the
 * skipped tags and wrapping with `loop`; Home and End the first and last tag not skipped; Space
 * and Enter select; Delete and Backspace remove. A key with a modifier does nothing.
 */
export function tagGroupKeyTarget(
    event: TagKeyEvent,
    index: number,
    count: number,
    options: TagGroupKeyOptions,
): TagGroupKeyAction | null {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return null;
    }
    const { key } = event;
    if (key === " " || key === "Enter") {
        return options.selectable ? { type: "select" } : null;
    }
    if (key === "Delete" || key === "Backspace") {
        return options.removable ? { type: "remove" } : null;
    }
    const roving = {
        orientation: "horizontal" as const,
        rtl: options.rtl,
        loop: options.loop,
        ...(options.skip === undefined ? {} : { skip: options.skip }),
    };
    // ArrowDown and ArrowUp read the tags in order, as the next and previous arrows
    const moved =
        key === "ArrowDown"
            ? rovingKeyTarget(
                  options.rtl ? "ArrowLeft" : "ArrowRight",
                  index,
                  count,
                  roving,
              )
            : key === "ArrowUp"
              ? rovingKeyTarget(
                    options.rtl ? "ArrowRight" : "ArrowLeft",
                    index,
                    count,
                    roving,
                )
              : rovingKeyTarget(key, index, count, roving);
    return moved === null ? null : { type: "focus", index: moved };
}

/**
 * Where the focus goes once the item at `removed` of `count` items is gone (spec/tag-group.md,
 * "Focus"): the first item after it not skipped, else the last one before it not skipped, else -1
 * (the container). The index is the item's in the list before the removal.
 */
export function removalFocusIndex(
    count: number,
    removed: number,
    skip: (index: number) => boolean = () => false,
): number {
    for (let index = removed + 1; index < count; index++) {
        if (!skip(index)) {
            return index;
        }
    }
    for (let index = Math.min(removed, count) - 1; index >= 0; index--) {
        if (!skip(index)) {
            return index;
        }
    }
    return -1;
}

/** The arrows that move toward the first tag and toward the Input, for the direction. */
function tagArrows(rtl: boolean): { previous: string; next: string } {
    return rtl
        ? { previous: "ArrowRight", next: "ArrowLeft" }
        : { previous: "ArrowLeft", next: "ArrowRight" };
}

/** What a key in a TagsInput's Input does (spec/tags-input.md, "Keyboard"). */
export type TagsInputInputKeyAction =
    | { type: "add" }
    | { type: "focus-tag"; index: number };

/**
 * The action of a key in a TagsInput's Input of `count` tags, or `null` for a key it leaves to the
 * input: Enter adds (the caller checks the text is not blank); Backspace and the previous arrow,
 * with the caret at the start and no text selected, focus the last tag. A key with Ctrl, Meta or
 * Alt does nothing.
 */
export function tagsInputInputKeyTarget(
    event: TagKeyEvent,
    caret: { selectionStart: number | null; selectionEnd: number | null },
    count: number,
    rtl: boolean,
): TagsInputInputKeyAction | null {
    if (event.altKey || event.ctrlKey || event.metaKey) {
        return null;
    }
    if (event.key === "Enter") {
        return { type: "add" };
    }
    const atStart = caret.selectionStart === 0 && caret.selectionEnd === 0;
    if (
        atStart &&
        count > 0 &&
        !event.shiftKey &&
        (event.key === "Backspace" || event.key === tagArrows(rtl).previous)
    ) {
        return { type: "focus-tag", index: count - 1 };
    }
    return null;
}

/** What a key on a TagsInput's focused tag does (spec/tags-input.md, "Keyboard"). */
export type TagsInputTagKeyAction =
    /** Focus a tag (its index) or the Input. */
    | { type: "focus"; target: number | "input" }
    /** Remove the tag, then focus a tag (its index once removed) or the Input. */
    | { type: "remove"; focus: number | "input" }
    /** Edit the tag in its TagInput. */
    | { type: "edit" }
    /** Focus the Input, which receives the key (a printable character). */
    | { type: "type" };

/**
 * The action of a key on the tag at `index` of a TagsInput's `count` tags (spec/tags-input.md,
 * "Keyboard"), or `null` for a key it leaves alone: the previous arrow focuses the previous tag
 * (none on the first), the next arrow the next tag or, past the last, the Input; Backspace removes
 * it and focuses the previous tag, else the one now at its place, else the Input; Delete removes it
 * and focuses the one now at its place, else the previous tag, else the Input; Enter edits it when
 * `editable`; Escape focuses the Input; a printable character goes to the Input. A key with Ctrl,
 * Meta or Alt does nothing.
 */
export function tagsInputTagKeyTarget(
    event: TagKeyEvent,
    index: number,
    count: number,
    options: { rtl: boolean; editable: boolean },
): TagsInputTagKeyAction | null {
    if (event.altKey || event.ctrlKey || event.metaKey) {
        return null;
    }
    const { key } = event;
    const arrows = tagArrows(options.rtl);
    if (key === arrows.previous) {
        return index > 0 ? { type: "focus", target: index - 1 } : null;
    }
    if (key === arrows.next) {
        return {
            type: "focus",
            target: index < count - 1 ? index + 1 : "input",
        };
    }
    // the tags left once it is removed: `count - 1`, the one after it now at `index`
    const left = count - 1;
    if (key === "Backspace") {
        return {
            type: "remove",
            focus: index > 0 ? index - 1 : left > 0 ? 0 : "input",
        };
    }
    if (key === "Delete") {
        return {
            type: "remove",
            focus: index < left ? index : left > 0 ? left - 1 : "input",
        };
    }
    if (key === "Enter") {
        return options.editable ? { type: "edit" } : null;
    }
    if (key === "Escape") {
        return { type: "focus", target: "input" };
    }
    if (key.length === 1) {
        return { type: "type" };
    }
    return null;
}
