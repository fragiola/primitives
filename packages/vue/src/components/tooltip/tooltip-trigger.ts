import { defineComponent } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TooltipKey } from "./tooltip-context.ts";

function isFocusVisible(element: Element): boolean {
    try {
        return element.matches(":focus-visible");
    } catch {
        return true;
    }
}

/** The described control and the anchor (spec/tooltip.md). */
export interface TooltipTriggerState {
    open: boolean;
}

export const TooltipTrigger: PartComponent<
    Record<never, never>,
    TooltipTriggerState
> = publicComponent(
    defineComponent({
        name: "TooltipTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(TooltipKey, "Tooltip.Trigger");
            const setTrigger = elementSetter(context.trigger);
            return () => {
                const open = context.open.value;
                const { "aria-describedby": describedBy, ...rest } = attrs;
                const description =
                    [describedBy, open ? context.popupId : undefined]
                        .filter(Boolean)
                        .join(" ") || undefined;
                return renderPart(
                    "button",
                    { attrs: rest, slots },
                    props.as,
                    { open },
                    {
                        type: "button",
                        id: context.triggerId,
                        "aria-describedby": description,
                        "data-primitives-part": "tooltip-trigger",
                        ...stateAttributes({ "popup-open": open }),
                        onPointerenter: (event: PointerEvent) => {
                            // a tap never opens a tooltip
                            if (event.pointerType !== "touch") {
                                context.hoverStart();
                            }
                        },
                        onPointerleave: (event: PointerEvent) => {
                            if (event.pointerType !== "touch") {
                                context.hoverEnd();
                            }
                        },
                        onPointerdown: () => context.press(),
                        onFocus: (event: FocusEvent) => {
                            if (
                                !context.disabled() &&
                                isFocusVisible(event.currentTarget as Element)
                            ) {
                                context.show("trigger-focus", true);
                            }
                        },
                        onBlur: () => {
                            if (context.open.value) {
                                context.hide("trigger-focus");
                            }
                        },
                        ref: setTrigger,
                    },
                );
            };
        },
    }),
);
