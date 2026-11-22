import { defineComponent, h, mergeProps } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    DialogViewport,
    type DialogViewportState,
} from "../dialog/dialog-viewport.ts";
import { DrawerKey } from "./drawer-context.ts";

/** Dialog's Viewport, with the swipe's `data-swiping`. */
export const DrawerViewport: PartComponent<
    Record<never, never>,
    DialogViewportState
> = publicComponent(
    defineComponent({
        name: "DrawerViewport",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const { swipe } = useRequiredContext(DrawerKey, "Drawer.Viewport");
            return () =>
                h(
                    DialogViewport,
                    mergeProps(
                        stateAttributes({ swiping: swipe.value.swiping }),
                        attrs,
                        { as: props.as },
                    ),
                    slots,
                );
        },
    }),
);
