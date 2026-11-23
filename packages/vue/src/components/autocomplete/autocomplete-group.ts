import { defineComponent, provide, useId } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { AutocompleteGroupKey } from "./autocomplete-context.ts";

/** A `group` of items, named by its GroupLabel (spec/autocomplete.md). */
export const AutocompleteGroup: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "AutocompleteGroup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const labelId = `${useId()}-label`;
            provide(AutocompleteGroupKey, { labelId });
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        role: "group",
                        "aria-labelledby": labelId,
                        "data-primitives-part": "autocomplete-group",
                    },
                );
        },
    }),
);
