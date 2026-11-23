import { defineComponent, onBeforeUnmount, onMounted, useId, watch } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { MeterKey, type MeterState, meterState } from "./meter-context.ts";

export interface MeterLabelProps {
    id?: string;
}

/** Names the meter (`aria-labelledby`, spec/meter.md). */
export const MeterLabel: PartComponent<MeterLabelProps, MeterState> =
    publicComponent(
        defineComponent({
            name: "MeterLabel",
            inheritAttrs: false,
            props: { ...asProp, id: { type: String, default: undefined } },
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(MeterKey, "Meter.Label");
                const generated = useId();
                const id = () => props.id ?? generated;
                // once mounted, as React's layout effect: a server render has no `aria-labelledby`
                onMounted(() => {
                    context.labelId.value = id();
                    watch(id, (next) => {
                        context.labelId.value = next;
                    });
                });
                onBeforeUnmount(() => {
                    context.labelId.value = undefined;
                });
                return () => {
                    const current = context.current.value;
                    return renderPart(
                        "span",
                        { attrs, slots },
                        props.as,
                        meterState(current),
                        {
                            id: id(),
                            "data-primitives-part": "meter-label",
                        },
                    );
                };
            },
        }),
    );
