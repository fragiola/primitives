import { defineComponent, provide, ref, shallowRef } from "vue";
import {
    overlayRootEmits,
    overlayRootProps,
    useOverlayRoot,
} from "../../composables/use-overlay-root.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { DialogKey } from "./dialog-context.ts";

/** Holds the dialog's state (`v-model:open`); renders no element (spec/dialog.md). */
export interface DialogRootProps {
    open?: boolean;
    defaultOpen?: boolean;
}

export type DialogRootEmits = {
    "update:open": (open: boolean) => true;
    openChange: (open: boolean, details: ChangeDetails) => true;
};

export const DialogRoot: PublicComponent<
    DialogRootProps,
    ContentSlots,
    DialogRootEmits
> = publicComponent(
    defineComponent({
        name: "DialogRoot",
        props: overlayRootProps,
        emits: overlayRootEmits,
        setup(props, { emit, slots }) {
            const root = useOverlayRoot(props, emit);
            provide(DialogKey, {
                ...root,
                backdrop: shallowRef(null),
                titleId: ref(),
                descriptionId: ref(),
            });
            return () => slots.default?.();
        },
    }),
);
