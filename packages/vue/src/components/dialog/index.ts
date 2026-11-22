// The entry of @fragiola/primitives-vue/dialog: a modal dialog (spec/dialog.md, the APG's
// dialog-modal pattern).

export type {
    OverlayRootEmits,
    OverlayRootProps,
    OverlayTriggerRootProps,
} from "../../composables/use-overlay-root.ts";
export type { OverlayTriggerProps } from "../../composables/use-overlay-trigger.ts";
export type {
    ChangeDetails,
    ChangeReason,
    FocusTarget,
    OpenChangeDetails,
    OverlayActions,
} from "../../utils/change-details.ts";
export type { OverlayHandle } from "../../utils/overlay-handle.ts";
export type { OverlayPortalProps } from "../../utils/overlay-portal.ts";
export type { OverlayRootSlots } from "../../utils/public-component.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type {
    DialogBackdropProps,
    DialogBackdropState,
} from "./dialog-backdrop.ts";
export { createDialogHandle, type DialogHandle } from "./dialog-handle.ts";
export type { DialogPopupProps, DialogPopupState } from "./dialog-popup.ts";
export type { DialogPortalProps } from "./dialog-portal.ts";
export type { DialogRootEmits, DialogRootProps } from "./dialog-root.ts";
export type {
    DialogTriggerProps,
    DialogTriggerState,
} from "./dialog-trigger.ts";
export type { DialogViewportState } from "./dialog-viewport.ts";
export { Dialog } from "./parts.ts";
