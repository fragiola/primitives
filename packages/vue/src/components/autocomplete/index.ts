// The entry of @fragiola/primitives-vue/autocomplete: a free-text input with a list of
// suggestions, whose value is the text (spec/autocomplete.md, the APG's combobox with list
// autocomplete). It shares Combobox's behaviour through the package's shared composables and the
// toolkit's `/collection`, never Combobox's entry.

export type {
    ItemFilter,
    ItemGroup,
} from "@fragiola/primitives/collection";
export type {
    Align,
    Side,
} from "@fragiola/primitives/positioning";
export type {
    OverlayRootEmits,
    OverlayRootProps,
} from "../../composables/use-overlay-root.ts";
export type { PositionerProps } from "../../composables/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OverlayActions,
} from "../../utils/change-details.ts";
export type { OverlayPortalProps } from "../../utils/overlay-portal.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type { AutocompleteDisabledState } from "./autocomplete-clear.ts";
export type { AutocompleteMode } from "./autocomplete-context.ts";
export type { AutocompleteOpenState } from "./autocomplete-input.ts";
export type {
    AutocompleteItemProps,
    AutocompleteItemState,
} from "./autocomplete-item.ts";
export type {
    AutocompleteListSlots,
    AutocompleteListState,
} from "./autocomplete-list.ts";
export type { AutocompletePopupState } from "./autocomplete-popup.ts";
export type { AutocompletePortalProps } from "./autocomplete-portal.ts";
export type { AutocompletePositionerState } from "./autocomplete-positioner.ts";
export type {
    AutocompleteFilter,
    AutocompleteItemToString,
    AutocompleteRootEmits,
    AutocompleteRootProps,
} from "./autocomplete-root.ts";
export type { AutocompleteValueSlots } from "./autocomplete-value.ts";
export { Autocomplete } from "./parts.ts";
