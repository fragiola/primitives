import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";

/** A polite live region for the consumer's text (spec/autocomplete.md). */
export const AutocompleteStatus: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "AutocompleteStatus",
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
                        role: "status",
                        "aria-live": "polite",
                        "aria-atomic": "true",
                        "data-primitives-part": "autocomplete-status",
                    },
                );
        },
    }),
);
