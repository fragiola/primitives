import type { ListModel } from "./list-model.ts";

/** How many options a list selects (spec/listbox.md, "API"). */
export type SelectionMode = "none" | "single" | "multiple";

/**
 * The APG's two multiple selection models (spec/listbox.md, "Keyboard"): `toggle`, the
 * recommended one (a move never selects, Space toggles); `replace`, the alternative one (the
 * selection follows the focus, Ctrl moves without selecting).
 */
export type SelectionBehavior = "toggle" | "replace";

/** A list's selection: the selected keys, in the model's order, and the range anchor. */
export interface SelectionState {
    selected: readonly string[];
    /** The option the last toggle or replace selected: where a range starts. */
    anchor: string | null;
}

/**
 * A change of the selection: `toggle` one option, `replace` the selection with one option, select
 * the `range` from the anchor (or `from`) to `key`, or select `all` (none, when every enabled
 * option already is).
 */
export type SelectionChange =
    | { type: "toggle"; key: string }
    | { type: "replace"; key: string }
    | { type: "range"; key: string; from?: string }
    | { type: "all" };

export interface SelectionOptions {
    mode: SelectionMode;
    behavior: SelectionBehavior;
}

/** `keys` in the model's order; keys the model does not know stay at the end, in their order. */
export function inModelOrder(
    model: ListModel,
    keys: Iterable<string>,
): string[] {
    const unique = [...new Set(keys)];
    const known = unique
        .filter((key) => model.indexOf(key) !== -1)
        .sort((a, b) => model.indexOf(a) - model.indexOf(b));
    return [...known, ...unique.filter((key) => model.indexOf(key) === -1)];
}

/** The enabled keys from `a` to `b` (either way round), in order. */
function rangeKeys(model: ListModel, a: string, b: string): string[] {
    const from = model.indexOf(a);
    const to = model.indexOf(b);
    if (from === -1 || to === -1) {
        return [];
    }
    return model.nodes
        .slice(Math.min(from, to), Math.max(from, to) + 1)
        .filter((node) => node.disabled !== true)
        .map((node) => node.key);
}

/**
 * The selection after `change` (spec/listbox.md, "Keyboard" and "Pointer"), or `state` itself
 * when nothing changes. A disabled option is never selected: a change aimed at one does nothing,
 * a range and `all` pass over them (a disabled option already selected, by a controlled value,
 * stays). `single`: every change but `all` selects its option alone (the selected one stays
 * selected). `multiple`: `toggle` flips an option and makes it the anchor; `replace` makes it the
 * only one and the anchor; a `range` adds to the selection with `toggle`, replaces it with
 * `replace`, and moves the anchor only when it starts `from` a given key; `all` selects every
 * enabled option, or unselects them when they all are. `none`: nothing changes.
 */
export function applySelection(
    model: ListModel,
    state: SelectionState,
    change: SelectionChange,
    options: SelectionOptions,
): SelectionState {
    const { mode, behavior } = options;
    if (mode === "none") {
        return state;
    }
    if (change.type !== "all" && model.isDisabled(change.key)) {
        return state;
    }
    if (mode === "single") {
        if (change.type === "all") {
            return state;
        }
        if (state.selected.length === 1 && state.selected[0] === change.key) {
            return state;
        }
        return { selected: [change.key], anchor: change.key };
    }
    switch (change.type) {
        case "toggle": {
            const selected = state.selected.includes(change.key)
                ? state.selected.filter((key) => key !== change.key)
                : inModelOrder(model, [...state.selected, change.key]);
            return { selected, anchor: change.key };
        }
        case "replace":
            return { selected: [change.key], anchor: change.key };
        case "range": {
            // an anchor the list no longer has (its option removed) is no anchor
            const anchor =
                state.anchor !== null && model.indexOf(state.anchor) !== -1
                    ? state.anchor
                    : null;
            const from = change.from ?? anchor ?? change.key;
            const keys = rangeKeys(model, from, change.key);
            const kept =
                behavior === "replace"
                    ? state.selected.filter((key) => model.isDisabled(key))
                    : state.selected;
            return {
                selected: inModelOrder(model, [...kept, ...keys]),
                anchor:
                    change.from !== undefined
                        ? change.from
                        : (anchor ?? change.key),
            };
        }
        case "all": {
            const enabled = model.enabledKeys;
            const all = enabled.every((key) => state.selected.includes(key));
            const others = state.selected.filter(
                (key) => !enabled.includes(key),
            );
            return {
                selected: all
                    ? others
                    : inModelOrder(model, [...others, ...enabled]),
                anchor: state.anchor,
            };
        }
    }
}

/** Whether two selections hold the same keys in the same order. */
export function sameSelection(
    a: readonly string[],
    b: readonly string[],
): boolean {
    return a.length === b.length && a.every((key, index) => b[index] === key);
}
