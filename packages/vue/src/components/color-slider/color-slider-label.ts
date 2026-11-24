import { defineComponent, onBeforeUnmount, useId, watch } from "vue";
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

export interface ColorSliderLabelProps {
    id?: string;
}

/**
 * Names the slider: the Root and the Thumb while it has no name of its own. A press on it
 * focuses the Thumb (spec/color-slider.md, Slider's Label).
 */
export const ColorSliderLabel: PartComponent<
    ColorSliderLabelProps,
    ColorSliderState
> = publicComponent(
    defineComponent({
        name: "ColorSliderLabel",
        inheritAttrs: false,
        props: {
            ...asProp,
            id: { type: String, default: undefined },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ColorSliderKey,
                "ColorSlider.Label",
            );
            const generated = useId();
            const id = () => props.id ?? generated;
            // cleared on unmount, not in the watch's cleanup: a server render stops the watch
            // once the label is rendered, before the thumb reads the id (as Slider's Label)
            watch(id, (current) => (context.labelId.value = current), {
                immediate: true,
            });
            onBeforeUnmount(() => {
                if (context.labelId.value === id()) {
                    context.labelId.value = undefined;
                }
            });
            // a `div` has no native `for`: the press focuses the thumb (Base UI's Slider)
            const onClick = () => {
                if (!context.disabled()) {
                    context.thumb.value?.focus();
                }
            };
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    colorSliderState(context),
                    {
                        id: id(),
                        "data-primitives-part": "color-slider-label",
                        ...stateAttributes(colorSliderAttributes(context)),
                        onClick,
                    },
                );
        },
    }),
);
