// The entry of @fragiola/primitives-angular/clipboard: a copy button, its copied state and a polite
// announcement (spec/clipboard.md), as standalone directives on the consumer's own elements. The
// copy and the announcement are the toolkit's `/clipboard`.

export type {
    ChangeDetails,
    ChangeReason,
} from "@fragiola/primitives-angular/internal";
export { ClipboardIndicator } from "./directives/clipboard-indicator.directive.ts";
export { ClipboardInput } from "./directives/clipboard-input.directive.ts";
export {
    ClipboardRoot,
    type ClipboardState,
    type ClipboardStatus,
    type ClipboardStatusChangeEvent,
    type ClipboardStatusDetails,
} from "./directives/clipboard-root.directive.ts";
export { ClipboardTrigger } from "./directives/clipboard-trigger.directive.ts";
