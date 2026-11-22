import { defineComponent, inject } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { MenuKey } from "./menu-context.ts";

export const MenuSeparator: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "MenuSeparator",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const component = inject(MenuKey, null)?.component ?? "menu";
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        role: "separator",
                        "aria-orientation": "horizontal",
                        "data-primitives-part": `${component}-separator`,
                    },
                );
        },
    }),
);
