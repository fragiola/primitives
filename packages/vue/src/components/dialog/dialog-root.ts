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
import type { DialogHandle } from "./dialog-handle.ts";
import { dialogRootProps, setupDialogRoot } from "./dialog-root-base.ts";

/**
 * Holds the dialog's state (`v-model:open`); renders no element (spec/dialog.md). A template ref
 * on it exposes the actions, `close()` and `unmount()`.
 */
export interface DialogRootProps
    extends OverlayRootProps,
        OverlayTriggerRootProps {
    /** Connects Triggers rendered outside the Root (spec/dialog.md, "Detached triggers"). */
    handle?: DialogHandle;
}

export type DialogRootEmits = OverlayRootEmits;

export const DialogRoot: PublicComponent<
    DialogRootProps,
    OverlayRootSlots,
    DialogRootEmits
> = publicComponent(
    defineComponent({
        name: "DialogRoot",
        props: {
            ...dialogRootProps,
            handle: {
                type: Object as PropType<DialogHandle>,
                default: undefined,
            },
        },
        emits: overlayRootEmits,
        setup(props, context) {
            return setupDialogRoot("dialog", props, context);
        },
    }),
);
