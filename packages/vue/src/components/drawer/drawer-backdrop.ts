import { defineComponent, h, mergeProps } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    DialogBackdrop,
    type DialogBackdropProps,
    type DialogBackdropState,
} from "../dialog/dialog-backdrop.ts";
import { DrawerKey } from "./drawer-context.ts";

/** Dialog's Backdrop, with the swipe's `data-swiping` and `--drawer-swipe-progress`. */
export const DrawerBackdrop: PartComponent<
    DialogBackdropProps,
    DialogBackdropState
> = publicComponent(
    defineComponent({
        name: "DrawerBackdrop",
        inheritAttrs: false,
        props: { ...asProp, forceRender: { type: Boolean, default: false } },
        setup(props, { attrs, slots }) {
            const { swipe } = useRequiredContext(DrawerKey, "Drawer.Backdrop");
            return () =>
                h(
                    DialogBackdrop,
                    mergeProps(
                        {
                            style: {
                                "--drawer-swipe-progress": swipe.value.progress,
                            },
                            ...stateAttributes({
                                swiping: swipe.value.swiping,
                            }),
                        },
                        attrs,
                        { as: props.as, forceRender: props.forceRender },
                    ),
                    slots,
                );
        },
    }),
);
