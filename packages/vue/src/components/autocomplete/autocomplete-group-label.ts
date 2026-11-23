import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { AutocompleteGroupKey } from "./autocomplete-context.ts";

/** Names its Group. */
export const AutocompleteGroupLabel: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "AutocompleteGroupLabel",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const group = useRequiredContext(
                AutocompleteGroupKey,
                "Autocomplete.GroupLabel",
            );
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        id: group.labelId,
                        "data-primitives-part": "autocomplete-group-label",
                    },
                );
        },
    }),
);
