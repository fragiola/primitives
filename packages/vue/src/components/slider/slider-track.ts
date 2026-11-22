import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import type { SliderState } from "./slider-context.ts";
import { SliderKey, sliderState } from "./slider-context.ts";

/** The rail (spec/slider.md). */
export const SliderTrack: PartComponent<
    Record<never, never>,
    SliderState
> = publicComponent(
    defineComponent({
        name: "SliderTrack",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(SliderKey, "Slider.Track");
            return () => {
                const state = sliderState(context);
                return renderPart("div", { attrs, slots }, props.as, state, {
                    "data-primitives-part": "slider-track",
                    ...stateAttributes({
                        orientation: state.orientation,
                        disabled: state.disabled,
                        dragging: state.dragging,
                    }),
                });
            };
        },
    }),
);
