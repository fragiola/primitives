// The entry of @fragiola/primitives-react/autocomplete: a free-text input with a list of
// suggestions, whose value is the text (spec/autocomplete.md, the APG's combobox with list
// autocomplete). It shares Combobox's behaviour through the package's shared hooks and the
// toolkit's `/collection`, never Combobox's entry.

export type {
    ItemFilter,
    ItemGroup,
} from "@fragiola/primitives/collection";
export type {
    Align,
    Side,
} from "@fragiola/primitives/positioning";
export type { OverlayPortalProps } from "../../hooks/use-overlay-portal.ts";
export type { OverlayRootProps } from "../../hooks/use-overlay-root.ts";
export type { PositionerProps } from "../../hooks/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OverlayActions,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type { AutocompleteMode } from "./autocomplete-context.ts";
export type {
    AutocompleteItemProps,
    AutocompleteItemState,
} from "./autocomplete-item.tsx";
export type { AutocompleteListProps } from "./autocomplete-list.tsx";
export type { AutocompletePortalProps } from "./autocomplete-portal.tsx";
export type {
    AutocompletePositionerProps,
    AutocompletePositionerState,
} from "./autocomplete-positioner.tsx";
export type { AutocompleteRootProps } from "./autocomplete-root.tsx";
export type { AutocompleteValueProps } from "./autocomplete-value.tsx";
export { Autocomplete } from "./parts.ts";
