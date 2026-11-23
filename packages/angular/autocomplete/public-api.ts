// The entry of @fragiola/primitives-angular/autocomplete: a free-text input with a list of
// suggestions, whose value is the text (spec/autocomplete.md, the APG's combobox with list
// autocomplete), as standalone attribute directives on the consumer's own elements. It shares
// Combobox's behaviour through `/internal` and the toolkit, never Combobox's entry.

export type {
    ItemFilter,
    ItemGroup,
} from "@fragiola/primitives/collection";
export type { Align, Side } from "@fragiola/primitives/positioning";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OpenChangeEvent,
    OverlayActions,
    OverlayPortalOptions,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { AutocompleteClear } from "./directives/autocomplete-clear.directive.ts";
export { AutocompleteEmpty } from "./directives/autocomplete-empty.directive.ts";
export { AutocompleteGroup } from "./directives/autocomplete-group.directive.ts";
export { AutocompleteGroupLabel } from "./directives/autocomplete-group-label.directive.ts";
export { AutocompleteInput } from "./directives/autocomplete-input.directive.ts";
export { AutocompleteInputGroup } from "./directives/autocomplete-input-group.directive.ts";
export {
    AutocompleteItem,
    type AutocompleteItemState,
} from "./directives/autocomplete-item.directive.ts";
export { AutocompleteList } from "./directives/autocomplete-list.directive.ts";
export { AutocompletePopup } from "./directives/autocomplete-popup.directive.ts";
export { AutocompletePortal } from "./directives/autocomplete-portal.directive.ts";
export { AutocompletePositioner } from "./directives/autocomplete-positioner.directive.ts";
export {
    type AutocompleteItemInfo,
    type AutocompleteItemValue,
    type AutocompleteMode,
    type AutocompletePending,
    AutocompleteRoot,
    type AutocompleteShown,
    type AutocompleteState,
} from "./directives/autocomplete-root.directive.ts";
export { AutocompleteSeparator } from "./directives/autocomplete-separator.directive.ts";
export { AutocompleteStatus } from "./directives/autocomplete-status.directive.ts";
export { AutocompleteTrigger } from "./directives/autocomplete-trigger.directive.ts";
export { injectAutocomplete } from "./inject/inject-autocomplete.ts";
