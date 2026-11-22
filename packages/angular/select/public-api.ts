// The entry of @fragiola/primitives-angular/select: one value chosen from a list popped up by a
// button, with form support (spec/select.md, the APG's select-only combobox), as standalone
// attribute directives on the consumer's own elements.

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
export { SelectGroup } from "./directives/select-group.directive.ts";
export { SelectGroupLabel } from "./directives/select-group-label.directive.ts";
export {
    SelectItem,
    type SelectItemState,
} from "./directives/select-item.directive.ts";
export { SelectItemIndicator } from "./directives/select-item-indicator.directive.ts";
export { SelectItemText } from "./directives/select-item-text.directive.ts";
export { SelectList } from "./directives/select-list.directive.ts";
export { SelectPopup } from "./directives/select-popup.directive.ts";
export { SelectPortal } from "./directives/select-portal.directive.ts";
export { SelectPositioner } from "./directives/select-positioner.directive.ts";
export {
    type RegisteredItem,
    type SelectItemData,
    SelectRoot,
    type SelectState,
} from "./directives/select-root.directive.ts";
export { SelectSeparator } from "./directives/select-separator.directive.ts";
export {
    SelectTrigger,
    type SelectTriggerState,
} from "./directives/select-trigger.directive.ts";
export { SelectValue } from "./directives/select-value.directive.ts";
