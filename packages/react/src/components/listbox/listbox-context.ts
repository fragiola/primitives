import { createContext } from "react";

/** A rendered Item, as the Root knows it. */
export interface ListboxItemEntry {
    element: HTMLElement;
    value: string;
    /** The text typeahead matches (`label`, else the element's text, read when needed). */
    label: string | undefined;
    disabled: boolean;
}

export interface ListboxContextValue {
    multiple: boolean;
    disabled: boolean;
    orientation: "horizontal" | "vertical";
    /** The selected values, as a list in both modes. */
    selected: readonly string[];
    /** The Item holding the tab stop (`tabindex="0"`); `null` before the items are known. */
    tabStop: HTMLElement | null;
    /** The focused Item while the focus is in the list (`data-highlighted`). */
    highlighted: HTMLElement | null;
    register: (entry: ListboxItemEntry) => () => void;
    /** An Item took focus. */
    focused: (element: HTMLElement) => void;
    /** A press on an Item, with its modifiers (spec/listbox.md, "Pointer"). */
    press: (element: HTMLElement, event: MouseEvent) => void;
}

export const ListboxContext = createContext<ListboxContextValue | null>(null);

export interface ListboxItemContextValue {
    selected: boolean;
}

export const ListboxItemContext = createContext<ListboxItemContextValue | null>(
    null,
);

/** A Group's setter of its GroupLabel's id. */
export const ListboxGroupContext = createContext<
    ((id: string | undefined) => void) | null
>(null);
