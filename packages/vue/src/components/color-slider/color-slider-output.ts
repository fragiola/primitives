import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ColorSliderKey,
    type ColorSliderState,
    colorSliderAttributes,
    colorSliderState,
} from "./color-slider-context.ts";

/**
 * Shows the channel's value as text (`Intl`: `"120°"`, `"50%"`), an `output` for the Thumb; a
 * default slot of its own (`v-slot="{ state }"`) replaces it (spec/color-slider.md).
 */
export const ColorSliderOutput: PartComponent<
    Record<never, never>,
    ColorSliderState
> = publicComponent(
    defineComponent({
        name: "ColorSliderOutput",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ColorSliderKey,
                "ColorSlider.Output",
            );
            return () => {
                const state = colorSliderState(context);
                const id = context.thumb.value?.id;
                return renderPart(
                    "output",
                    { attrs, slots },
                    props.as,
                    state,
                    {
                        for: id === undefined || id === "" ? undefined : id,
                        "aria-live": "off",
                        "data-primitives-part": "color-slider-output",
                        ...stateAttributes(colorSliderAttributes(context)),
                    },
                    () =>
                        slots.default
                            ? slots.default({ state })
                            : context.valueText.value,
                );
            };
        },
    }),
);
