// The entry of @fragiola/primitives-vue/combobox-virtual: Combobox's opt-in virtual and async
// list (spec/virtual-lists.md), on the toolkit's virtualizer (`/virtual`). An app that does not
// import it ships neither.

export type {
    VirtualListEmits,
    VirtualListProps,
} from "../../composables/use-virtual-rows.ts";
// the component it is built on, from this entry too: an app imports both from here
export { Combobox } from "../combobox/parts.ts";
export type {
    ComboboxVirtualListProps,
    ComboboxVirtualListSlots,
} from "./combobox-virtual-list.ts";
export { ComboboxVirtual } from "./parts.ts";
