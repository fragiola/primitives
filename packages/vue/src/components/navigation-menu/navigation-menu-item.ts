import { defineComponent, provide, shallowRef, useId } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import {
    NavigationMenuItemKey,
    NavigationMenuKey,
} from "./navigation-menu-context.ts";

/** One item: a Trigger with its Content, or a Link (spec/navigation-menu.md). */
export interface NavigationMenuItemProps {
    /** The item's value (generated when not given). */
    value?: string;
}

export const NavigationMenuItem: PartComponent<
    NavigationMenuItemProps,
    Record<string, never>
> = publicComponent(
    defineComponent({
        name: "NavigationMenuItem",
        inheritAttrs: false,
        props: { ...asProp, value: { type: String, default: undefined } },
        setup(props, { attrs, slots }) {
            useRequiredContext(NavigationMenuKey, "NavigationMenu.Item");
            const generated = useId();
            provide(NavigationMenuItemKey, {
                value: () => props.value ?? generated,
                contentId: `${generated}-content`,
                content: shallowRef(null),
            });
            return () =>
                renderPart(
                    "li",
                    { attrs, slots },
                    props.as,
                    {},
                    { "data-primitives-part": "navigation-menu-item" },
                );
        },
    }),
);
