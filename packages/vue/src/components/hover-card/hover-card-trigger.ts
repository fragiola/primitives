import { defineComponent, type PropType } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import {
    type OverlayTriggerProps,
    overlayTriggerProps,
    useOverlayTrigger,
} from "../../composables/use-overlay-trigger.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { HoverCardKey } from "./hover-card-context.ts";
import type { HoverCardHandle } from "./hover-card-handle.ts";

function isFocusVisible(element: Element): boolean {
    try {
        return element.matches(":focus-visible");
    } catch {
        return true;
    }
}

/** The link the card previews, and the anchor; with a `handle`, anywhere (spec/hover-card.md). */
export interface HoverCardTriggerState {
    open: boolean;
}

export interface HoverCardTriggerProps
    extends OverlayTriggerProps<HoverCardHandle, unknown> {}

export const HoverCardTrigger: PartComponent<
    HoverCardTriggerProps,
    HoverCardTriggerState
> = publicComponent(
    defineComponent({
        name: "HoverCardTrigger",
        inheritAttrs: false,
        props: {
            ...asProp,
            ...overlayTriggerProps,
            handle: {
                type: Object as PropType<HoverCardHandle>,
                default: undefined,
            },
        },
        setup(props, { attrs, slots }) {
            const trigger = useOverlayTrigger(
                HoverCardKey,
                "HoverCard.Trigger",
                props,
            );
            const setTrigger = elementSetter(trigger.element);
            return () => {
                const root = trigger.root.value;
                const active = trigger.active.value;
                return renderPart(
                    "a",
                    { attrs, slots },
                    props.as,
                    { open: active },
                    {
                        id: trigger.id.value,
                        "data-primitives-part": "hover-card-trigger",
                        ...stateAttributes({ "popup-open": active }),
                        onPointerenter: (event: PointerEvent) => {
                            // a tap follows the link: no card
                            if (event.pointerType !== "touch") {
                                root?.intentStart(
                                    "trigger-hover",
                                    event.currentTarget as HTMLElement,
                                    event,
                                );
                            }
                        },
                        onPointerleave: (event: PointerEvent) => {
                            if (event.pointerType !== "touch") {
                                root?.hoverEnd(
                                    event.currentTarget as HTMLElement,
                                );
                            }
                        },
                        onFocus: (event: FocusEvent) => {
                            const target = event.currentTarget as HTMLElement;
                            if (isFocusVisible(target)) {
                                root?.intentStart(
                                    "trigger-focus",
                                    target,
                                    event,
                                );
                            }
                        },
                        onBlur: (event: FocusEvent) => {
                            root?.blur(
                                event.currentTarget as HTMLElement,
                                event,
                            );
                        },
                        ref: setTrigger,
                    },
                );
            };
        },
    }),
);
