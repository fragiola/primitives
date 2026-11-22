import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    NavigationMenuItemKey,
    NavigationMenuKey,
} from "./navigation-menu-context.ts";

/** A decorative mark inside a Trigger (a chevron the recipe draws). */
export const NavigationMenuIcon: PartComponent<
    Record<never, never>,
    { open: boolean }
> = publicComponent(
    defineComponent({
        name: "NavigationMenuIcon",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                NavigationMenuKey,
                "NavigationMenu.Icon",
            );
            const item = useRequiredContext(
                NavigationMenuItemKey,
                "NavigationMenu.Icon",
            );
            return () => {
                const open = context.value.value === item.value();
                return renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    { open },
                    {
                        "aria-hidden": "true",
                        "data-primitives-part": "navigation-menu-icon",
                        ...stateAttributes({ "popup-open": open }),
                    },
                );
            };
        },
    }),
);
