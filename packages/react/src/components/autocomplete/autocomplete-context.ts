import type { Align, Side } from "@fragiola/primitives/positioning";
import { createContext, type MutableRefObject } from "react";
import type { FieldControlBinding } from "../../hooks/use-field-control.ts";
import type { OverlayRoot } from "../../hooks/use-overlay-root.ts";
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

export interface AutocompleteContextValue extends OverlayRoot {
    field: FieldControlBinding;
    mode: AutocompleteMode;
    /** The value: the typed or chosen text. */
    value: string;
    /** The text a highlight shows instead of the value, or `null`. */
    shown: AutocompleteShown | null;
    /** Types `text` (spec/autocomplete.md, "Keyboard": typing). */
    type: (text: string, addition: boolean, event: Event) => void;
    disabled: boolean;
    /** The Input's form name (the field's, else the Root's). */
    name: string | undefined;
    required: boolean;
    openOnInputClick: boolean;
    /** The highlighted item's id. */
    highlighted: string | null;
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
    hasItems: boolean;
    /** The matching entries: items, or groups with their matching items. */
    entries: readonly unknown[];
    items: Map<HTMLElement, AutocompleteItemInfo>;
    list: HTMLElement | null;
    setList: (element: HTMLElement | null) => void;
    button: HTMLElement | null;
    setButton: (element: HTMLElement | null) => void;
    inputGroup: HTMLElement | null;
    setInputGroup: (element: HTMLElement | null) => void;
    clearButton: HTMLElement | null;
    setClearButton: (element: HTMLElement | null) => void;
    listId: string;
    pending: MutableRefObject<AutocompletePending>;
    /** Bumped when a pending highlight is asked for, so the List applies it. */
    pendingTick: number;
    requestHighlight: (pending: AutocompletePending) => void;
    placed: { side: Side; align: Align };
    setPlaced: (placed: { side: Side; align: Align }) => void;
    itemCount: number;
    setItemCount: (count: number) => void;
}

export const AutocompleteContext =
    createContext<AutocompleteContextValue | null>(null);

export interface AutocompleteGroupContextValue {
    labelId: string;
}

export const AutocompleteGroupContext =
    createContext<AutocompleteGroupContextValue | null>(null);

/** The rendered items of the list, in order. */
export function orderedItems(
    context: AutocompleteContextValue,
): AutocompleteItemInfo[] {
    if (context.list === null) {
        return [];
    }
    return [...context.list.querySelectorAll<HTMLElement>('[role="option"]')]
        .map((element) => context.items.get(element))
        .filter((item): item is AutocompleteItemInfo => item !== undefined);
}
