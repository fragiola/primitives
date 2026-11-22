// The entry of @fragiola/primitives-angular/combobox: a text input that filters a popup list, for
// one value or several, with form support (spec/combobox.md, the APG's combobox; D10), as
// standalone attribute directives on the consumer's own elements.

export type {
    ItemEquality,
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
export { ComboboxChip } from "./directives/combobox-chip.directive.ts";
export { ComboboxChipRemove } from "./directives/combobox-chip-remove.directive.ts";
export { ComboboxChips } from "./directives/combobox-chips.directive.ts";
export { ComboboxClear } from "./directives/combobox-clear.directive.ts";
export { ComboboxEmpty } from "./directives/combobox-empty.directive.ts";
export { ComboboxGroup } from "./directives/combobox-group.directive.ts";
export { ComboboxGroupLabel } from "./directives/combobox-group-label.directive.ts";
export { ComboboxInput } from "./directives/combobox-input.directive.ts";
export { ComboboxInputGroup } from "./directives/combobox-input-group.directive.ts";
export {
    ComboboxItem,
    type ComboboxItemState,
} from "./directives/combobox-item.directive.ts";
export { ComboboxItemIndicator } from "./directives/combobox-item-indicator.directive.ts";
export { ComboboxList } from "./directives/combobox-list.directive.ts";
export { ComboboxPopup } from "./directives/combobox-popup.directive.ts";
export { ComboboxPortal } from "./directives/combobox-portal.directive.ts";
export { ComboboxPositioner } from "./directives/combobox-positioner.directive.ts";
export {
    type ComboboxItemInfo,
    type ComboboxItemValue,
    ComboboxRoot,
    type ComboboxState,
    type PendingHighlight,
} from "./directives/combobox-root.directive.ts";
export { ComboboxSeparator } from "./directives/combobox-separator.directive.ts";
export { ComboboxStatus } from "./directives/combobox-status.directive.ts";
export { ComboboxTrigger } from "./directives/combobox-trigger.directive.ts";
export { injectCombobox } from "./inject/inject-combobox.ts";
