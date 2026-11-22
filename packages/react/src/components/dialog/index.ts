// The entry of @fragiola/primitives-react/dialog: a modal dialog (spec/dialog.md, the APG's
// dialog-modal pattern).

export type { OverlayPortalProps } from "../../hooks/use-overlay-portal.ts";
export type {
    OverlayRootProps,
    OverlayTriggerRootProps,
} from "../../hooks/use-overlay-root.ts";
export type { OverlayTriggerProps } from "../../hooks/use-overlay-trigger.ts";
export type {
    ChangeDetails,
    ChangeReason,
    FocusTarget,
    OpenChangeDetails,
    OverlayActions,
} from "../../utils/change-details.ts";
export type { OverlayHandle } from "../../utils/overlay-handle.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type {
    DialogBackdropProps,
    DialogBackdropState,
} from "./dialog-backdrop.tsx";
export { createDialogHandle, type DialogHandle } from "./dialog-handle.ts";
export type { DialogPopupProps, DialogPopupState } from "./dialog-popup.tsx";
export type { DialogPortalProps } from "./dialog-portal.tsx";
export type { DialogRootProps } from "./dialog-root.tsx";
export type {
    DialogTriggerProps,
    DialogTriggerState,
} from "./dialog-trigger.tsx";
export type { DialogViewportState } from "./dialog-viewport.tsx";
export { Dialog } from "./parts.ts";
