// The entry of @fragiola/primitives-vue/autocomplete-virtual: Autocomplete's opt-in virtual and
// async list (spec/virtual-lists.md), on the toolkit's virtualizer (`/virtual`). An app that does
// not import it ships neither.

export type {
    VirtualListEmits,
    VirtualListProps,
} from "../../composables/use-virtual-rows.ts";
// the component it is built on, from this entry too: an app imports both from here
export { Autocomplete } from "../autocomplete/parts.ts";
export type {
    AutocompleteVirtualListProps,
    AutocompleteVirtualListSlots,
} from "./autocomplete-virtual-list.ts";
export { AutocompleteVirtual } from "./parts.ts";
