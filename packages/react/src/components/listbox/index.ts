// The entry of @fragiola/primitives-react/listbox: a list of options for choosing one value or
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
export type { RenderProp } from "../../utils/render-element.tsx";
export type { ListboxItemProps, ListboxItemState } from "./listbox-item.tsx";
export type { ListboxItemIndicatorProps } from "./listbox-item-indicator.tsx";
export type {
    ListboxRootMultipleProps,
    ListboxRootProps,
    ListboxRootSingleProps,
    ListboxRootState,
} from "./listbox-root.tsx";
export { Listbox } from "./parts.ts";
