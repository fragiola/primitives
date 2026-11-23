import { tabsKeyTarget } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import { defineComponent, shallowRef } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CarouselKey, type CarouselState } from "./carousel-context.ts";
import { useNativeListener } from "./use-native-listener.ts";

/**
 * The slide picker controls (spec/carousel.md): a `group` of buttons, or in the tabbed variant a
 * `tablist` with the APG tabs' keys (automatic activation, wrapping), as Tabs' List.
 */
export const CarouselIndicatorGroup: PartComponent<
    Record<never, never>,
    CarouselState
> = publicComponent(
    defineComponent({
        name: "CarouselIndicatorGroup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                CarouselKey,
                "Carousel.IndicatorGroup",
            );
            const direction = useProvidedDirection();
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            useNativeListener(element, "keydown", (event) => {
                const list = element.value;
                if (context.variant() !== "tabbed" || list === null) {
                    return;
                }
                const tabs = [
                    ...list.querySelectorAll<HTMLElement>('[role="tab"]'),
                ];
                const current = tabs.indexOf(event.target as HTMLElement);
                if (current === -1) {
                    return;
                }
                const index = tabsKeyTarget(event.key, current, tabs.length, {
                    orientation: context.state().orientation,
                    rtl: getDirection(list, direction()) === "rtl",
                    loop: true,
                });
                if (index === null) {
                    return;
                }
                event.preventDefault();
                tabs[index]?.focus();
                context.setPage(index, { reason: "keyboard", event });
            });
            return () => {
                const state = context.state();
                const tabbed = context.variant() === "tabbed";
                return renderPart("div", { attrs, slots }, props.as, state, {
                    role: tabbed ? "tablist" : "group",
                    "aria-orientation": tabbed ? state.orientation : undefined,
                    "data-primitives-part": "carousel-indicator-group",
                    ...stateAttributes({ orientation: state.orientation }),
                    ref: setElement,
                });
            };
        },
    }),
);
