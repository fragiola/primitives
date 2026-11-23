import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { MeterKey, type MeterState, meterState } from "./meter-context.ts";

/**
 * The filled part, from the inline start (spec/meter.md): its structural style sets its
 * inline size, and `--meter-indicator-size`.
 */
export const MeterIndicator: PartComponent<
    Record<never, never>,
    MeterState
> = publicComponent(
    defineComponent({
        name: "MeterIndicator",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(MeterKey, "Meter.Indicator");
            return () => {
                const current = context.current.value;
                const { percent } = current;
                const style = {
                    insetInlineStart: 0,
                    inlineSize: `${percent}%`,
                    "--meter-indicator-size": `${percent}%`,
                };
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    meterState(current),
                    {
                        style,
                        "data-primitives-part": "meter-indicator",
                    },
                );
            };
        },
    }),
);
