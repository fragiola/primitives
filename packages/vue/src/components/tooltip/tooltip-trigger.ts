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
import { TooltipKey } from "./tooltip-context.ts";
import type { TooltipHandle } from "./tooltip-handle.ts";

function isFocusVisible(element: Element): boolean {
    try {
        return element.matches(":focus-visible");
    } catch {
        return true;
    }
}

/** A described control and the anchor; with a `handle`, anywhere in the page (spec/tooltip.md). */
export interface TooltipTriggerState {
    open: boolean;
}

export interface TooltipTriggerProps
    extends OverlayTriggerProps<TooltipHandle, unknown> {}

export const TooltipTrigger: PartComponent<
    TooltipTriggerProps,
    TooltipTriggerState
> = publicComponent(
    defineComponent({
        name: "TooltipTrigger",
        inheritAttrs: false,
        props: {
            ...asProp,
            ...overlayTriggerProps,
            handle: {
                type: Object as PropType<TooltipHandle>,
                default: undefined,
            },
        },
        setup(props, { attrs, slots }) {
            const trigger = useOverlayTrigger(
                TooltipKey,
                "Tooltip.Trigger",
                props,
            );
            const setTrigger = elementSetter(trigger.element);
            return () => {
                const root = trigger.root.value;
                const active = trigger.active.value;
                const { "aria-describedby": describedBy, ...rest } = attrs;
                const description =
                    [describedBy, active ? root?.popupId : undefined]
                        .filter(Boolean)
                        .join(" ") || undefined;
                return renderPart(
                    "button",
                    { attrs: rest, slots },
                    props.as,
                    { open: active },
                    {
                        type: "button",
                        id: trigger.id.value,
                        "aria-describedby": description,
                        "data-primitives-part": "tooltip-trigger",
                        ...stateAttributes({ "popup-open": active }),
                        onPointerenter: (event: PointerEvent) => {
                            // a tap never opens a tooltip
                            if (event.pointerType !== "touch") {
                                root?.hoverStart(
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
                        onPointerdown: (event: PointerEvent) => {
                            // a tap neither opens nor blocks it (the block ends on a pointer leave
                            // touch has not)
                            if (event.pointerType !== "touch") {
                                root?.press(event);
                            }
                        },
                        onFocus: (event: FocusEvent) => {
                            const target = event.currentTarget as HTMLElement;
                            if (
                                root !== null &&
                                !root.disabled() &&
                                isFocusVisible(target)
                            ) {
                                root.show("trigger-focus", true, event, target);
                            }
                        },
                        onBlur: (event: FocusEvent) => {
                            if (trigger.active.value) {
                                root?.hide("trigger-focus", event);
                            }
                        },
                        ref: setTrigger,
                    },
                );
            };
        },
    }),
);
