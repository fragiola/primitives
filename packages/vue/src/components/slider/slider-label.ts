import { defineComponent, onBeforeUnmount, useId, watch } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import type { SliderState } from "./slider-context.ts";
import { SliderKey, sliderState } from "./slider-context.ts";

export interface SliderLabelProps {
    id?: string;
}

/**
 * Names the slider and its thumbs with no name of their own (`aria-labelledby`); a press on it
 * focuses the first thumb (spec/slider.md).
 */
export const SliderLabel: PartComponent<SliderLabelProps, SliderState> =
    publicComponent(
        defineComponent({
            name: "SliderLabel",
            inheritAttrs: false,
            props: {
                ...asProp,
                id: { type: String, default: undefined },
            },
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(SliderKey, "Slider.Label");
                const generated = useId();
                const id = () => props.id ?? generated;
                // cleared on unmount, not in the watch's cleanup: a server render stops the watch
                // once the label is rendered, before the thumbs read the id (as Field.Label)
                watch(id, (current) => (context.labelId.value = current), {
                    immediate: true,
                });
                onBeforeUnmount(() => {
                    if (context.labelId.value === id()) {
                        context.labelId.value = undefined;
                    }
                });
                const onClick = () => {
                    context.thumbs.value[0]?.focus();
                };
                return () => {
                    const state = sliderState(context);
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        state,
                        {
                            id: id(),
                            "data-primitives-part": "slider-label",
                            ...stateAttributes({
                                orientation: state.orientation,
                                disabled: state.disabled,
                            }),
                            onClick,
                        },
                    );
                };
            },
        }),
    );
