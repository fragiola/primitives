// The entry of @fragiola/primitives-react/combobox: a text input that filters a popup list, for one
// value or several, with form support (spec/combobox.md, the APG's combobox; D10).

export type {
    ItemEquality,
    ItemFilter,
    ItemGroup,
} from "@fragiola/primitives/collection";
export type {
    Align,
    Side,
} from "@fragiola/primitives/positioning";
export type { PositionerProps } from "../../hooks/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type { ComboboxItemProps, ComboboxItemState } from "./combobox-item.tsx";
export type { ComboboxItemIndicatorProps } from "./combobox-item-indicator.tsx";
export type { ComboboxListProps } from "./combobox-list.tsx";
export type { ComboboxPortalProps } from "./combobox-portal.tsx";
export type {
    ComboboxPositionerProps,
    ComboboxPositionerState,
} from "./combobox-positioner.tsx";
export type {
    ComboboxRootMultipleProps,
    ComboboxRootProps,
    ComboboxRootSingleProps,
} from "./combobox-root.tsx";
export type { ComboboxValueProps } from "./combobox-value.tsx";
export { Combobox } from "./parts.ts";
