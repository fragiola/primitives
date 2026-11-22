import { getTabbables } from "@fragiola/primitives/focus";
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
import { PopoverKey } from "./popover-context.ts";
import type { PopoverHandle } from "./popover-handle.ts";

/**
 * Toggles the popover and anchors it; with a `handle`, from anywhere in the page. While open, Tab
 * from the active trigger enters the popup (spec/popover.md).
 */
export interface PopoverTriggerState {
    open: boolean;
    disabled: boolean;
}

export interface PopoverTriggerProps
    extends OverlayTriggerProps<PopoverHandle, unknown> {
    disabled?: boolean;
}

export const PopoverTrigger: PartComponent<
    PopoverTriggerProps,
    PopoverTriggerState
> = publicComponent(
    defineComponent({
        name: "PopoverTrigger",
        inheritAttrs: false,
        props: {
            ...asProp,
            ...overlayTriggerProps,
            handle: {
                type: Object as PropType<PopoverHandle>,
                default: undefined,
            },
            disabled: { type: Boolean, default: false },
        },
        setup(props, { attrs, slots }) {
            const trigger = useOverlayTrigger(
                PopoverKey,
                "Popover.Trigger",
                props,
            );
            const setTrigger = elementSetter(trigger.element);
            return () => {
                const root = trigger.root.value;
                const active = trigger.active.value;
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    { open: active, disabled: props.disabled },
                    {
                        type: "button",
                        id: trigger.id.value,
                        disabled: props.disabled,
                        "aria-haspopup": "dialog",
                        "aria-expanded": active ? "true" : "false",
                        "aria-controls": active ? root?.popupId : undefined,
                        "data-primitives-part": "popover-trigger",
                        ...stateAttributes({
                            "popup-open": active,
                            disabled: props.disabled,
                        }),
                        onClick: (event: MouseEvent) =>
                            root?.setOpen(
                                !active,
                                "trigger-press",
                                event,
                                event.currentTarget as HTMLElement,
                            ),
                        onKeydown: (event: KeyboardEvent) => {
                            const popup = root?.popup.value;
                            if (
                                event.key === "Tab" &&
                                !event.shiftKey &&
                                active &&
                                popup
                            ) {
                                event.preventDefault();
                                (getTabbables(popup)[0] ?? popup).focus();
                            }
                        },
                        ref: setTrigger,
                    },
                );
            };
        },
    }),
);
