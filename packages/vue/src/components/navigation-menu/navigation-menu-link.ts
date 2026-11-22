import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { NavigationMenuKey } from "./navigation-menu-context.ts";

/** A link, in the List or in a Content (spec/navigation-menu.md). */
export interface NavigationMenuLinkProps {
    /** The link of the current page (`aria-current="page"`). */
    active?: boolean;
}

export const NavigationMenuLink: PartComponent<
    NavigationMenuLinkProps,
    { active: boolean }
> = publicComponent(
    defineComponent({
        name: "NavigationMenuLink",
        inheritAttrs: false,
        props: { ...asProp, active: { type: Boolean, default: false } },
        setup(props, { attrs, slots }) {
            useRequiredContext(NavigationMenuKey, "NavigationMenu.Link");
            return () =>
                renderPart(
                    "a",
                    { attrs, slots },
                    props.as,
                    { active: props.active },
                    {
                        "aria-current": props.active ? "page" : undefined,
                        "data-primitives-part": "navigation-menu-link",
                        ...stateAttributes({ active: props.active }),
                    },
                );
        },
    }),
);
