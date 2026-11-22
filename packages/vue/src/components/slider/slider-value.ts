import { computed, defineComponent, type SlotsType, type VNode } from "vue";
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
import { stateAttributes } from "../../utils/state-attributes.ts";
import type { SliderState } from "./slider-context.ts";
import { SliderKey, sliderState } from "./slider-context.ts";

/** What the Value's default scoped slot receives. */
export interface SliderValueSlotProps {
    /** The values as `format` writes them (else the plain numbers), in order. */
    formattedValues: readonly string[];
    values: readonly number[];
    state: SliderState;
}

export interface SliderValueSlots {
    default?: (scope: SliderValueSlotProps) => VNode[];
    render?: (scope: RenderSlotProps<SliderState>) => VNode[];
}

/** The `" – "` between the values of a range (Base UI's separator: punctuation, not copy). */
const SEPARATOR = " – ";

/**
 * Shows the slider's value: the formatted values joined with `" – "`, or the default scoped slot
 * `{ formattedValues, values }` (spec/slider.md). An `output` for the thumbs.
 */
export const SliderValue: PublicComponent<{ as?: AsProp }, SliderValueSlots> =
    publicComponent(
        defineComponent({
            name: "SliderValue",
            inheritAttrs: false,
            props: asProp,
            slots: Object as SlotsType<SliderValueSlots>,
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(SliderKey, "Slider.Value");
                // the thumbs' ids in value order: their `index`, else their order
                const thumbIds = computed(() =>
                    context.thumbIds.value
                        .map((entry, order) => ({
                            id: entry.id(),
                            index: entry.index() ?? order,
                        }))
                        .sort((a, b) => a.index - b.index)
                        .map((entry) => entry.id),
                );
                return () => {
                    const state = sliderState(context);
                    const values = context.values.value;
                    const formattedValues = values.map(context.formatValue);
                    return renderPart(
                        "output",
                        { attrs, slots },
                        props.as,
                        state,
                        {
                            for: thumbIds.value.join(" ") || undefined,
                            "aria-live": "off",
                            "data-primitives-part": "slider-value",
                            ...stateAttributes({
                                orientation: state.orientation,
                                disabled: state.disabled,
                            }),
                        },
                        () =>
                            slots.default
                                ? slots.default({
                                      formattedValues,
                                      values,
                                      state,
                                  })
                                : formattedValues.join(SEPARATOR),
                    );
                };
            },
        }),
    );
