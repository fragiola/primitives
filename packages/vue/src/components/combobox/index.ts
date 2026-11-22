// The entry of @fragiola/primitives-vue/combobox: a text input that filters a popup list, for one
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
export type { PositionerProps } from "../../composables/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type { ComboboxDisabledState } from "./combobox-clear.ts";
export type { ComboboxItemState } from "./combobox-context.ts";
export type { ComboboxOpenState } from "./combobox-input.ts";
export type { ComboboxItemProps } from "./combobox-item.ts";
export type {
    ComboboxItemIndicatorProps,
    ComboboxItemIndicatorState,
} from "./combobox-item-indicator.ts";
export type { ComboboxListSlots, ComboboxListState } from "./combobox-list.ts";
export type { ComboboxPopupState } from "./combobox-popup.ts";
export type { ComboboxPortalProps } from "./combobox-portal.ts";
export type { ComboboxPositionerState } from "./combobox-positioner.ts";
export type {
    ComboboxFilter,
    ComboboxItemEquality,
    ComboboxItemToString,
    ComboboxRootEmits,
    ComboboxRootProps,
} from "./combobox-root.ts";
export type { ComboboxValueSlots } from "./combobox-value.ts";
export { Combobox } from "./parts.ts";
