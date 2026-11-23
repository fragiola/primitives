import type { ComputedRef, InjectionKey, Ref } from "vue";

/** An Item of the list, as it registered; each getter is read when it is needed. */
export interface ListboxItemEntry {
    element: HTMLElement;
    value: () => string;
    /** The text typeahead matches (`label`, else the element's text, read when needed). */
    label: () => string | undefined;
    disabled: () => boolean;
}

export interface ListboxContext {
    multiple: () => boolean;
    disabled: () => boolean;
    orientation: () => "horizontal" | "vertical";
    /** The selected values, as a list in both modes. */
    selected: ComputedRef<readonly string[]>;
    /** The Item holding the tab stop (`tabindex="0"`); `null` before the items are known. */
    tabStop: ComputedRef<HTMLElement | null>;
    /** The focused Item while the focus is in the list (`data-highlighted`). */
    highlighted: ComputedRef<HTMLElement | null>;
    register: (entry: ListboxItemEntry) => () => void;
    /** An Item took focus. */
    focused: (element: HTMLElement) => void;
    /** A press on an Item, with its modifiers (spec/listbox.md, "Pointer"). */
    press: (element: HTMLElement, event: MouseEvent) => void;
}

export const ListboxKey: InjectionKey<ListboxContext> = Symbol("Listbox");

export interface ListboxItemState {
    selected: boolean;
    highlighted: boolean;
    disabled: boolean;
}

export const ListboxItemKey: InjectionKey<ComputedRef<ListboxItemState>> =
    Symbol("ListboxItem");

/** A Group's GroupLabel id. */
export const ListboxGroupKey: InjectionKey<Ref<string | undefined>> =
    Symbol("ListboxGroup");
