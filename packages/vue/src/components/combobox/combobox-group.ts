import { defineComponent, provide, useId } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { ComboboxGroupKey } from "./combobox-context.ts";

/** A `group` of items, named by its GroupLabel (spec/combobox.md). */
export const ComboboxGroup: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "ComboboxGroup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const labelId = `${useId()}-label`;
            provide(ComboboxGroupKey, { labelId });
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        role: "group",
                        "aria-labelledby": labelId,
                        "data-primitives-part": "combobox-group",
                    },
                );
        },
    }),
);
