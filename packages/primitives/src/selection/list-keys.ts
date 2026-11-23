import { edgeIndex, stepIndex } from "../collection/list-navigation.ts";
import type { ListModel } from "./list-model.ts";
import type {
    SelectionBehavior,
    SelectionChange,
    SelectionMode,
} from "./selection.ts";

/** The keys of a listbox's key event that matter (a `KeyboardEvent`, or a framework's). */
export interface ListKeyEvent {
    key: string;
    shiftKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    altKey: boolean;
}

export interface ListKeyOptions {
    orientation: "horizontal" | "vertical";
    rtl: boolean;
    /** Wrap from the last option to the first, and back (`loopFocus`). */
    loop: boolean;
    mode: SelectionMode;
    behavior: SelectionBehavior;
    /** The option a page away from `index` (PageDown `1`, PageUp `-1`); default: the last / first. */
    page?: (index: number, delta: 1 | -1) => number;
    /** The option the typeahead moves to for a printable character, or -1. */
    typeahead?: (character: string, index: number) => number;
}

/** What a key does: the option it focuses (`index`, maybe the focused one) and its selection change. */
export interface ListKeyResult {
    index: number;
    selection: SelectionChange | null;
}

/** Where a plain focus move lands, or `null` for a key that moves nothing. */
function moveTarget(
    key: string,
    index: number,
    model: ListModel,
    options: ListKeyOptions,
): number | null {
    const vertical = options.orientation === "vertical";
    const next = vertical
        ? "ArrowDown"
        : options.rtl
          ? "ArrowLeft"
          : "ArrowRight";
    const previous = vertical
        ? "ArrowUp"
        : options.rtl
          ? "ArrowRight"
          : "ArrowLeft";
    const count = model.size;
    switch (key) {
        case next:
        case previous:
            return stepIndex(count, index, key === next ? 1 : -1, {
                loop: options.loop,
            });
        case "Home":
            return edgeIndex(count, "first");
        case "End":
            return edgeIndex(count, "last");
        case "PageDown":
        case "PageUp": {
            const delta = key === "PageDown" ? 1 : -1;
            if (options.page !== undefined && index !== -1) {
                return options.page(index, delta);
            }
            return edgeIndex(count, delta === 1 ? "last" : "first");
        }
        default:
            return null;
    }
}

/**
 * What a key does in a listbox (spec/listbox.md, "Keyboard"), from the focused option `index`:
 * `null` for a key it does not handle (Tab, Alt, the other orientation's arrows, a character no
 * option starts with). A focus move (the arrows, Home, End, PageUp, PageDown, the typeahead)
 * selects the option it lands on in the `replace` model, unless Ctrl (or Meta) is held; Shift with
 * an arrow toggles the option it lands on (multiple); Space and Enter select (single), toggle
 * (`toggle`) or replace (`replace`), Ctrl + Space toggles, Shift + Space selects the range from the
 * anchor; Ctrl + Shift + Home / End the range from the focused option to the end, which it focuses;
 * Ctrl + A selects all (multiple). Disabled options take focus; `applySelection` keeps them out.
 */
export function listKeyTarget(
    event: ListKeyEvent,
    model: ListModel,
    index: number,
    options: ListKeyOptions,
): ListKeyResult | null {
    if (event.altKey || model.size === 0) {
        return null;
    }
    const ctrl = event.ctrlKey || event.metaKey;
    const multiple = options.mode === "multiple";
    const focusedKey = model.nodes[index]?.key;
    const key = event.key;

    if (key === " " || key === "Enter") {
        if (focusedKey === undefined || options.mode === "none") {
            return null;
        }
        if (multiple && event.shiftKey) {
            return { index, selection: { type: "range", key: focusedKey } };
        }
        const toggles = multiple && (options.behavior === "toggle" || ctrl);
        return {
            index,
            selection: {
                type: toggles ? "toggle" : "replace",
                key: focusedKey,
            },
        };
    }
    if (ctrl && !event.shiftKey && (key === "a" || key === "A")) {
        return multiple ? { index, selection: { type: "all" } } : null;
    }
    const target = moveTarget(key, index, model, options);
    if (target === null || target === -1) {
        if (key.length === 1 && !ctrl && options.typeahead !== undefined) {
            const found = options.typeahead(key, index);
            if (found === -1) {
                return null;
            }
            return {
                index: found,
                selection: followFocus(found, model, options),
            };
        }
        return null;
    }
    const targetKey = model.nodes[target]?.key;
    if (targetKey === undefined) {
        return null;
    }
    if (
        multiple &&
        ctrl &&
        event.shiftKey &&
        (key === "Home" || key === "End")
    ) {
        return {
            index: target,
            selection:
                focusedKey === undefined
                    ? { type: "range", key: targetKey }
                    : { type: "range", key: targetKey, from: focusedKey },
        };
    }
    if (event.shiftKey && multiple && key !== "Home" && key !== "End") {
        // the APG: Shift + an arrow moves to the next option and toggles it
        return target === index
            ? { index, selection: null }
            : { index: target, selection: { type: "toggle", key: targetKey } };
    }
    if (ctrl) {
        return { index: target, selection: null };
    }
    return { index: target, selection: followFocus(target, model, options) };
}

/** The `replace` model's selection that follows a plain focus move, or none. */
function followFocus(
    index: number,
    model: ListModel,
    options: ListKeyOptions,
): SelectionChange | null {
    const key = model.nodes[index]?.key;
    if (
        key === undefined ||
        options.behavior !== "replace" ||
        options.mode === "none"
    ) {
        return null;
    }
    return { type: "replace", key };
}

/** What a press on an option does (spec/listbox.md, "Pointer"), with its modifiers. */
export function listPressSelection(
    key: string,
    event: { shiftKey: boolean; ctrlKey: boolean; metaKey: boolean },
    options: { mode: SelectionMode; behavior: SelectionBehavior },
): SelectionChange | null {
    if (options.mode === "none") {
        return null;
    }
    if (options.mode === "single") {
        return { type: "replace", key };
    }
    if (event.shiftKey) {
        return { type: "range", key };
    }
    if (options.behavior === "toggle" || event.ctrlKey || event.metaKey) {
        return { type: "toggle", key };
    }
    return { type: "replace", key };
}
