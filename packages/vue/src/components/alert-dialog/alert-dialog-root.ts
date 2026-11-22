import { defineComponent, type PropType } from "vue";
import {
    type OverlayRootEmits,
    type OverlayRootProps,
    type OverlayTriggerRootProps,
    overlayRootEmits,
} from "../../composables/use-overlay-root.ts";
import {
    type OverlayRootSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    dialogRootProps,
    setupDialogRoot,
} from "../dialog/dialog-root-base.ts";
import type { AlertDialogHandle } from "./alert-dialog-handle.ts";

/**
 * Holds the alert dialog's state (`v-model:open`); renders no element (spec/alert-dialog.md). Its
 * parts are Dialog's, named `alert-dialog-*`: always modal, never dismissed from outside, its first
 * Close focused on open. A template ref on it exposes the actions, `close()` and `unmount()`.
 */
export interface AlertDialogRootProps
    extends OverlayRootProps,
        OverlayTriggerRootProps {
    /** Connects Triggers rendered outside the Root (spec/alert-dialog.md, "Detached triggers"). */
    handle?: AlertDialogHandle;
}

export type AlertDialogRootEmits = OverlayRootEmits;

export const AlertDialogRoot: PublicComponent<
    AlertDialogRootProps,
    OverlayRootSlots,
    AlertDialogRootEmits
> = publicComponent(
    defineComponent({
        name: "AlertDialogRoot",
        props: {
            ...dialogRootProps,
            handle: {
                type: Object as PropType<AlertDialogHandle>,
                default: undefined,
            },
        },
        emits: overlayRootEmits,
        setup(props, context) {
            return setupDialogRoot("alert-dialog", props, context);
        },
    }),
);
