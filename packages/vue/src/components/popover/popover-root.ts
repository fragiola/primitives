import type { Align, Side } from "@fragiola/primitives/positioning";
import { defineComponent, type PropType, provide, ref, shallowRef } from "vue";
import {
    type OverlayRootEmits,
    type OverlayRootProps,
    type OverlayTriggerRootProps,
    overlayRootEmits,
    overlayRootProps,
    overlayTriggerRootProps,
    useOverlayRoot,
} from "../../composables/use-overlay-root.ts";
import { useAttachHandle } from "../../composables/use-overlay-trigger.ts";
import {
    type OverlayRootSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { type PopoverContext, PopoverKey } from "./popover-context.ts";
import type { PopoverHandle } from "./popover-handle.ts";

/**
 * Holds the popover's state (`v-model:open`); renders no element (spec/popover.md). A template
 * ref on it exposes the actions, `close()` and `unmount()`.
 */
export interface PopoverRootProps
    extends OverlayRootProps,
        OverlayTriggerRootProps {
    /** Connects Triggers rendered outside the Root (spec/popover.md, "Detached triggers"). */
    handle?: PopoverHandle;
}

export type PopoverRootEmits = OverlayRootEmits;

export const PopoverRoot: PublicComponent<
    PopoverRootProps,
    OverlayRootSlots,
    PopoverRootEmits
> = publicComponent(
    defineComponent({
        name: "PopoverRoot",
        props: {
            ...overlayRootProps,
            ...overlayTriggerRootProps,
            handle: {
                type: Object as PropType<PopoverHandle>,
                default: undefined,
            },
        },
        emits: overlayRootEmits,
        setup(props, { emit, slots, expose }) {
            const root = useOverlayRoot(props, emit);
            const context: PopoverContext = {
                ...root,
                arrow: shallowRef(null),
                placed: ref<{ side: Side; align: Align }>({
                    side: "bottom",
                    align: "center",
                }),
                titleId: ref(),
                descriptionId: ref(),
            };
            provide(PopoverKey, context);
            useAttachHandle(() => props.handle, context);
            expose(root.actions);
            return () => slots.default?.({ payload: root.payload.value });
        },
    }),
);
