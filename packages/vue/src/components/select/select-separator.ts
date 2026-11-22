import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";

/** Between items or groups; no role of its own (a `listbox` owns only groups and options). */
export const SelectSeparator: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "SelectSeparator",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        role: "presentation",
                        "data-orientation": "horizontal",
                        "data-primitives-part": "select-separator",
                    },
                );
        },
    }),
);
