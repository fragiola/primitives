import { defineComponent, shallowRef } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CarouselKey } from "./carousel-context.ts";
import { useNativeListener } from "./use-native-listener.ts";

/** What the AutoplayTrigger renders with. */
export interface CarouselAutoplayTriggerState {
    playing: boolean;
}

/**
 * Stops and starts the rotation (spec/carousel.md): the APG's rotation control, whose label (the
 * app's, from the default slot's `{ state }`) changes with the state, with no `aria-pressed`.
 */
export const CarouselAutoplayTrigger: PartComponent<
    Record<never, never>,
    CarouselAutoplayTriggerState
> = publicComponent(
    defineComponent({
        name: "CarouselAutoplayTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                CarouselKey,
                "Carousel.AutoplayTrigger",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            useNativeListener(element, "click", (event) => {
                context.setPlaying(!context.state().playing, {
                    reason: "trigger-press",
                    event,
                });
            });
            return () => {
                const playing = context.state().playing;
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    { playing },
                    {
                        type: "button",
                        "data-primitives-part": "carousel-autoplay-trigger",
                        ...stateAttributes({ playing }),
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
