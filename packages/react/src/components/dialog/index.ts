// The entry of @fragiola/primitives-react/dialog: a modal dialog (spec/dialog.md, the APG's
// dialog-modal pattern).

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type { DialogBackdropState } from "./dialog-backdrop.tsx";
export type { DialogPopupProps, DialogPopupState } from "./dialog-popup.tsx";
export type { DialogPortalProps } from "./dialog-portal.tsx";
export type { DialogRootProps } from "./dialog-root.tsx";
export type {
    DialogTriggerProps,
    DialogTriggerState,
} from "./dialog-trigger.tsx";
export { Dialog } from "./parts.ts";
