import { defineComponent, type SlotsType, type VNode } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    type AsProp,
    asProp,
    type RenderSlotProps,
    renderPart,
} from "../../utils/render-part.ts";
import { MeterKey, type MeterState, meterState } from "./meter-context.ts";

/** What the Value's default scoped slot receives. */
export interface MeterValueSlotProps {
    /** The value as `format` writes it. */
    formattedValue: string;
    /** The value, clamped to `[min, max]`. */
    value: number;
    state: MeterState;
}

export interface MeterValueSlots {
    default?: (scope: MeterValueSlotProps) => VNode[];
    render?: (scope: RenderSlotProps<MeterState>) => VNode[];
}

/** Shows the formatted value, or the default scoped slot `{ formattedValue, value }` (spec/meter.md). */
export const MeterValue: PublicComponent<{ as?: AsProp }, MeterValueSlots> =
    publicComponent(
        defineComponent({
            name: "MeterValue",
            inheritAttrs: false,
            props: asProp,
            slots: Object as SlotsType<MeterValueSlots>,
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(MeterKey, "Meter.Value");
                return () => {
                    const current = context.current.value;
                    const state = meterState(current);
                    const { formattedValue, value } = current;
                    return renderPart(
                        "span",
                        { attrs, slots },
                        props.as,
                        state,
                        {
                            "data-primitives-part": "meter-value",
                        },
                        () =>
                            slots.default
                                ? slots.default({
                                      formattedValue,
                                      value,
                                      state,
                                  })
                                : formattedValue,
                    );
                };
            },
        }),
    );
