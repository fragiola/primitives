import type { Align, Side } from "@fragiola/primitives/positioning";
import type { ComputedRef, InjectionKey, Ref, ShallowRef } from "vue";
import type { FieldControlBinding } from "../../composables/use-field-control.ts";
import type { OverlayRoot } from "../../composables/use-overlay-root.ts";
import type { ChangeReason } from "../../utils/change-details.ts";

/** How the autocomplete completes the text (spec/autocomplete.md, "API"). */
export type AutocompleteMode = "list" | "both" | "inline" | "none";

/** A rendered Item, as the Root knows it. */
export interface AutocompleteItemInfo {
    value: unknown;
    disabled: boolean;
    id: string;
}

/**
 * What the keyboard highlights once the list renders: the first or last suggestion, the first one
 * after typing (`autoHighlight`), or the inline completion of the typed text.
 */
export type AutocompletePending = "first" | "last" | "complete" | null;

/** The text a highlight shows in the input (`both`, `inline`), and the suggestion it comes from. */
export interface AutocompleteShown {
    item: unknown;
    text: string;
    /** Where the completion string starts: it is selected (`null`: the caret at the end). */
    selectFrom: number | null;
    /** A disabled suggestion is shown, never accepted. */
    disabled: boolean;
}

export interface AutocompleteContext extends OverlayRoot {
    field: FieldControlBinding;
    mode: () => AutocompleteMode;
    /** The value: the typed or chosen text. */
    value: ComputedRef<string>;
    /** The text a highlight shows instead of the value, or `null`. */
    shown: ShallowRef<AutocompleteShown | null>;
    /** The text the input shows: the highlight's, else the value. */
    text: () => string;
    /** Types `text` (spec/autocomplete.md, "Keyboard": typing). */
    type: (text: string, addition: boolean, event: Event) => void;
    /** Opens or closes; closing drops the highlight (and accepts an inline completion on leave). */
    setOpen: (open: boolean, reason: ChangeReason, event?: Event) => boolean;
    disabled: () => boolean;
    /** The Input's form name (the field's, else the Root's). */
    name: () => string | undefined;
    required: () => boolean;
    openOnInputClick: () => boolean;
    /** The highlighted item's id. */
    highlighted: Ref<string | null>;
    /** Highlights an item (or none); the keyboard's highlight shows its text inline. */
    highlight: (id: string | null, from: "keyboard" | "pointer") => void;
    /** Highlights a suggestion and completes the typed text with it, the rest selected. */
    complete: (item: AutocompleteItemInfo) => void;
    /** Chooses a suggestion: its text becomes the value, the list closes. */
    choose: (item: unknown, event?: Event) => void;
    /** Empties the text. */
    clear: (reason: ChangeReason, event?: Event) => void;
    /** A suggestion's text (`itemToStringValue`). */
    label: (item: unknown) => string;
    hasItems: () => boolean;
    /** The matching entries: items, or groups with their matching items. */
    entries: ComputedRef<readonly unknown[]>;
    items: Map<HTMLElement, AutocompleteItemInfo>;
    list: ShallowRef<HTMLElement | null>;
    button: ShallowRef<HTMLElement | null>;
    inputGroup: ShallowRef<HTMLElement | null>;
    clearButton: ShallowRef<HTMLElement | null>;
    listId: string;
    pending: { current: AutocompletePending };
    /** Bumped when a pending highlight is asked for, so the List applies it. */
    pendingTick: Ref<number>;
    requestHighlight: (pending: AutocompletePending) => void;
    placed: Ref<{ side: Side; align: Align }>;
    /** Bumped when items register, so `data-empty` and the pending highlight follow. */
    itemCount: Ref<number>;
}

export const AutocompleteKey: InjectionKey<AutocompleteContext> =
    Symbol("Autocomplete");

export const AutocompleteGroupKey: InjectionKey<{ labelId: string }> =
    Symbol("AutocompleteGroup");

/** Whether the list holds no item: no matching entry, or no rendered Item. */
export function isEmpty(context: AutocompleteContext): boolean {
    return context.hasItems()
        ? context.entries.value.length === 0
        : context.itemCount.value === 0;
}

/** The rendered items of the list, in order. */
export function orderedItems(
    context: AutocompleteContext,
): AutocompleteItemInfo[] {
    const list = context.list.value;
    if (list === null) {
        return [];
    }
    return [...list.querySelectorAll<HTMLElement>('[role="option"]')]
        .map((element) => context.items.get(element))
        .filter((item): item is AutocompleteItemInfo => item !== undefined);
}

/** The highlighted item, as registered. */
export function highlightedItem(
    context: AutocompleteContext,
): AutocompleteItemInfo | undefined {
    const id = context.highlighted.value;
    if (id === null) {
        return undefined;
    }
    for (const item of context.items.values()) {
        if (item.id === id) {
            return item;
        }
    }
    return undefined;
}
