// The entry of @fragiola/primitives-angular/collapsible: a button that shows and hides a panel
// (spec/collapsible.md, the APG's disclosure), as standalone directives on the consumer's own
// elements.

export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeEvent,
    TransitionStatus,
} from "@fragiola/primitives-angular/internal";
export {
    CollapsiblePanel,
    type CollapsiblePanelOptions,
    type CollapsiblePanelState,
} from "./directives/collapsible-panel.directive.ts";
export {
    CollapsibleRoot,
    type CollapsibleState,
} from "./directives/collapsible-root.directive.ts";
export { CollapsibleTrigger } from "./directives/collapsible-trigger.directive.ts";
