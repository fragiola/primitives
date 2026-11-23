// The entry of @fragiola/primitives-vue/listbox-virtual: Listbox's opt-in virtual and async list
// (spec/virtual-lists.md), on the toolkit's virtualizer (`/virtual`) and collections mechanism
// (`/selection`). Its options are `Listbox.Item`s (`@fragiola/primitives-vue/listbox`).

export type {
    SelectionBehavior,
    SelectionMode,
} from "@fragiola/primitives/selection";
export type {
    VirtualListEmits,
    VirtualListProps,
} from "../../composables/use-virtual-rows.ts";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
// the component it is built on, from this entry too: an app imports both from here
export { Listbox } from "../listbox/parts.ts";
export type {
    ListboxVirtualItem,
    ListboxVirtualRootEmits,
    ListboxVirtualRootProps,
    ListboxVirtualRootSlots,
} from "./listbox-virtual-root.ts";
export { ListboxVirtual } from "./parts.ts";
