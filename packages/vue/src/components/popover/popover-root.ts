import type { Align, Side } from "@fragiola/primitives/positioning";
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
import { PopoverKey } from "./popover-context.ts";

/** Holds the popover's state (`v-model:open`); renders no element (spec/popover.md). */
/** Holds the popover's state (`v-model:open`); renders no element (spec/popover.md). */
export interface PopoverRootProps {
    open?: boolean;
    defaultOpen?: boolean;
}

export type PopoverRootEmits = {
    "update:open": (open: boolean) => true;
    openChange: (open: boolean, details: ChangeDetails) => true;
};

export const PopoverRoot: PublicComponent<
    PopoverRootProps,
    ContentSlots,
    PopoverRootEmits
> = publicComponent(
    defineComponent({
        name: "PopoverRoot",
        props: overlayRootProps,
        emits: overlayRootEmits,
        setup(props, { emit, slots }) {
            const root = useOverlayRoot(props, emit);
            provide(PopoverKey, {
                ...root,
                arrow: shallowRef(null),
                placed: ref<{ side: Side; align: Align }>({
                    side: "bottom",
                    align: "center",
                }),
                titleId: ref(),
                descriptionId: ref(),
            });
            return () => slots.default?.();
        },
    }),
);
