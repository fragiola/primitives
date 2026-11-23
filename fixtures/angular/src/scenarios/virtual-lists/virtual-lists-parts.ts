// The virtual parts are their component's parts: the component's recipe styles them. A virtual
// list is its own scroll container, 320 px high (spec/virtual-lists.md, "Scenarios"): a popup's
// listbox that scrolls is the combobox's popup for axe, not a region to focus.

import type { VirtualItem } from "./items.ts";

/** The classes a popup's virtual list adds to its recipe's (React's `SCROLL`). */
export const SCROLL = "max-h-80 overflow-y-auto";

/** A row's item as a virtual item: the Combobox API types an item as `unknown`. */
export function asItem(item: unknown): VirtualItem {
    return item as VirtualItem;
}

/** A row's item as a label: the Autocomplete API types an item as `unknown`. */
export function asLabel(item: unknown): string {
    return item as string;
}
