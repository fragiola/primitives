import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";

/** The text of an Item that is its label (spec/select.md). */
export const SelectItemText: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "SelectItemText",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            return () =>
                renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    {},
                    { "data-primitives-part": "select-item-text" },
                );
        },
    }),
);
