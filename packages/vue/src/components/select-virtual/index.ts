// The entry of @fragiola/primitives-vue/select-virtual: Select's opt-in virtual and async list
// (spec/virtual-lists.md), on the toolkit's virtualizer (`/virtual`). An app that does not import
// it ships neither.

export type {
    VirtualListEmits,
    VirtualListProps,
} from "../../composables/use-virtual-rows.ts";
// the component it is built on, from this entry too: an app imports both from here
export { Select } from "../select/parts.ts";
export type { SelectItemData } from "../select/select-context.ts";
export { SelectVirtual } from "./parts.ts";
export type {
    SelectVirtualListProps,
    SelectVirtualListSlots,
} from "./select-virtual-list.ts";
