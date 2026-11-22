import { defineComponent } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { NavigationMenuKey } from "./navigation-menu-context.ts";

/** Where the open Content renders, inside the Popup (spec/navigation-menu.md). */
export const NavigationMenuViewport: PartComponent<
    Record<never, never>,
    Record<string, never>
> = publicComponent(
    defineComponent({
        name: "NavigationMenuViewport",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                NavigationMenuKey,
                "NavigationMenu.Viewport",
            );
            const setViewport = elementSetter(context.viewport);
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        "data-primitives-part": "navigation-menu-viewport",
                        ref: setViewport,
                    },
                );
        },
    }),
);
