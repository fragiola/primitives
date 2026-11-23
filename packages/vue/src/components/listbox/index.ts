// The entry of @fragiola/primitives-vue/listbox: a list of options for choosing one value or
// several, with form support (spec/listbox.md, the APG listbox). Its selection rules and key map
// are the toolkit's collections mechanism, `/selection`.

export type {
    SelectionBehavior,
    SelectionMode,
} from "@fragiola/primitives/selection";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type { ListboxItemState } from "./listbox-context.ts";
export type { ListboxItemProps } from "./listbox-item.ts";
export type {
    ListboxItemIndicatorProps,
    ListboxItemIndicatorState,
} from "./listbox-item-indicator.ts";
export type {
    ListboxRootEmits,
    ListboxRootProps,
    ListboxRootState,
} from "./listbox-root.ts";
export { Listbox } from "./parts.ts";
