// The entry of @fragiola/primitives-angular/dialog: a modal dialog (spec/dialog.md, the APG's
// dialog-modal pattern), as standalone attribute directives on the consumer's own elements.

export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeEvent,
} from "@fragiola/primitives-angular/internal";
export {
    DialogBackdrop,
    type DialogBackdropState,
} from "./directives/dialog-backdrop.directive.ts";
export { DialogClose } from "./directives/dialog-close.directive.ts";
export { DialogDescription } from "./directives/dialog-description.directive.ts";
export {
    DialogPopup,
    type DialogPopupState,
} from "./directives/dialog-popup.directive.ts";
export { DialogPortal } from "./directives/dialog-portal.directive.ts";
export {
    DialogRoot,
    type DialogState,
} from "./directives/dialog-root.directive.ts";
export { DialogTitle } from "./directives/dialog-title.directive.ts";
export {
    DialogTrigger,
    type DialogTriggerState,
} from "./directives/dialog-trigger.directive.ts";
export { injectDialog } from "./inject/inject-dialog.ts";
