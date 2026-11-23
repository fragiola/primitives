import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { AutocompleteKey, isEmpty } from "./autocomplete-context.ts";

/**
 * A polite live region, always rendered; its children are shown only while the list is empty
 * (spec/autocomplete.md).
 */
export const AutocompleteEmpty: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "AutocompleteEmpty",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                AutocompleteKey,
                "Autocomplete.Empty",
            );
            return () => {
                const empty = isEmpty(context);
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        role: "status",
                        "aria-live": "polite",
                        "aria-atomic": "true",
                        "data-primitives-part": "autocomplete-empty",
                    },
                    () => (empty ? slots.default?.({ state: {} }) : []),
                );
            };
        },
    }),
);
