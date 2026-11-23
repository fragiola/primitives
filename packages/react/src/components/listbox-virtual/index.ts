// The entry of @fragiola/primitives-react/listbox-virtual: Listbox's opt-in virtual and async list
// (spec/virtual-lists.md), on the toolkit's virtualizer (`/virtual`) and collections mechanism
// (`/selection`). Its options are `Listbox.Item`s (`@fragiola/primitives-react/listbox`).

export type {
    SelectionBehavior,
    SelectionMode,
} from "@fragiola/primitives/selection";
export type { VirtualListProps } from "../../hooks/use-virtual-rows.ts";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
// the component it is built on, from this entry too: an app imports both from here
export { Listbox } from "../listbox/parts.ts";
export type {
    ListboxVirtualItem,
    ListboxVirtualRootMultipleProps,
    ListboxVirtualRootProps,
    ListboxVirtualRootSingleProps,
} from "./listbox-virtual-root.tsx";
export { ListboxVirtual } from "./parts.ts";
