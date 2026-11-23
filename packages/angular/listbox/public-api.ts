// The entry of @fragiola/primitives-angular/listbox: a list of options for choosing one value or
// several, with form support (spec/listbox.md, the APG listbox), as standalone attribute
// directives on the consumer's own elements. Its selection rules and key map are the toolkit's
// collections mechanism, `/selection`.

export type {
    SelectionBehavior,
    SelectionMode,
} from "@fragiola/primitives/selection";
export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { ListboxGroup } from "./directives/listbox-group.directive.ts";
export { ListboxGroupLabel } from "./directives/listbox-group-label.directive.ts";
export {
    ListboxItem,
    type ListboxItemState,
} from "./directives/listbox-item.directive.ts";
export { ListboxItemIndicator } from "./directives/listbox-item-indicator.directive.ts";
export {
    type ListboxItemEntry,
    type ListboxOrientation,
    ListboxRoot,
    type ListboxRootState,
    type ListboxValue,
} from "./directives/listbox-root.directive.ts";
export { ListboxSeparator } from "./directives/listbox-separator.directive.ts";
