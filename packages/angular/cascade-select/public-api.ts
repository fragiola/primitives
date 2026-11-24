// The entry of @fragiola/primitives-angular/cascade-select: one path chosen through a tree of
// options, one list per level in a popup from a button, with form support
// (spec/cascade-select.md, the APG's select-only combobox with one listbox per open level), as
// standalone attribute directives on the consumer's own elements.

export type { CascadeItem } from "@fragiola/primitives/cascade";
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
export {
    CascadeSelectItem,
    type CascadeSelectItemState,
} from "./directives/cascade-select-item.directive.ts";
export { CascadeSelectItemIndicator } from "./directives/cascade-select-item-indicator.directive.ts";
export {
    CascadeSelectLevel,
    type CascadeSelectLevelState,
} from "./directives/cascade-select-level.directive.ts";
export { CascadeSelectPopup } from "./directives/cascade-select-popup.directive.ts";
export { CascadeSelectPortal } from "./directives/cascade-select-portal.directive.ts";
export { CascadeSelectPositioner } from "./directives/cascade-select-positioner.directive.ts";
export {
    CascadeSelectRoot,
    type CascadeSelectState,
} from "./directives/cascade-select-root.directive.ts";
export {
    CascadeSelectTrigger,
    type CascadeSelectTriggerState,
} from "./directives/cascade-select-trigger.directive.ts";
export { CascadeSelectValue } from "./directives/cascade-select-value.directive.ts";
