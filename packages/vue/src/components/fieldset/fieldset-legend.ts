import { defineComponent, onBeforeUnmount, useId, watch } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { FieldsetKey } from "../field/fieldset-context.ts";
import type { FieldsetState } from "./fieldset-root.ts";

export interface FieldsetLegendProps {
    id?: string;
}

/** Names its Fieldset (`aria-labelledby`): a `div`, not a native `legend` (spec/fieldset.md). */
export const FieldsetLegend: PartComponent<FieldsetLegendProps, FieldsetState> =
    publicComponent(
        defineComponent({
            name: "FieldsetLegend",
            inheritAttrs: false,
            props: {
                ...asProp,
                id: { type: String, default: undefined },
            },
            setup(props, { attrs, slots }) {
                const fieldset = useRequiredContext(
                    FieldsetKey,
                    "Fieldset.Legend",
                );
                const generated = useId();
                const id = () => props.id ?? generated;
                // cleared on unmount, not in the watch's cleanup (as Field.Label)
                watch(id, (current) => (fieldset.legendId.value = current), {
                    immediate: true,
                });
                onBeforeUnmount(() => {
                    if (fieldset.legendId.value === id()) {
                        fieldset.legendId.value = undefined;
                    }
                });
                return () => {
                    const state = { disabled: fieldset.disabled() };
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        state,
                        {
                            id: id(),
                            "data-primitives-part": "fieldset-legend",
                            ...stateAttributes(state),
                        },
                    );
                };
            },
        }),
    );
