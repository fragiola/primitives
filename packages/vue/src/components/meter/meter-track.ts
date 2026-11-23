import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { MeterKey, type MeterState, meterState } from "./meter-context.ts";

/** The rail the Indicator fills (spec/meter.md). */
export const MeterTrack: PartComponent<
    Record<never, never>,
    MeterState
> = publicComponent(
    defineComponent({
        name: "MeterTrack",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(MeterKey, "Meter.Track");
            return () => {
                const current = context.current.value;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    meterState(current),
                    {
                        "data-primitives-part": "meter-track",
                    },
                );
            };
        },
    }),
);
