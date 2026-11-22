import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { DrawerKey } from "./drawer-context.ts";

/**
 * The drawer's content: a mouse press inside it selects text instead of swiping (spec/drawer.md,
 * "Swipe"); a touch still swipes.
 */
export const DrawerContent: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "DrawerContent",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            useRequiredContext(DrawerKey, "Drawer.Content");
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {},
                    { "data-primitives-part": "drawer-content" },
                );
        },
    }),
);
