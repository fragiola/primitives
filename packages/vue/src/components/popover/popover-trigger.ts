import { getTabbables } from "@fragiola/primitives/focus";
import { defineComponent } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { PopoverKey } from "./popover-context.ts";

/** Toggles the popover and anchors it. While open, Tab from it enters the popup (spec/popover.md). */
export interface PopoverTriggerState {
    open: boolean;
    disabled: boolean;
}

export interface PopoverTriggerProps {
    disabled?: boolean;
}

export const PopoverTrigger: PartComponent<
    PopoverTriggerProps,
    PopoverTriggerState
> = publicComponent(
    defineComponent({
        name: "PopoverTrigger",
        inheritAttrs: false,
        props: { ...asProp, disabled: { type: Boolean, default: false } },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(PopoverKey, "Popover.Trigger");
            const setTrigger = elementSetter(context.trigger);
            return () => {
                const open = context.open.value;
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    { open, disabled: props.disabled },
                    {
                        type: "button",
                        id: context.triggerId,
                        disabled: props.disabled,
                        "aria-haspopup": "dialog",
                        "aria-expanded": open ? "true" : "false",
                        "aria-controls": open ? context.popupId : undefined,
                        "data-primitives-part": "popover-trigger",
                        ...stateAttributes({
                            "popup-open": open,
                            disabled: props.disabled,
                        }),
                        onClick: () => context.setOpen(!open, "trigger-press"),
                        onKeydown: (event: KeyboardEvent) => {
                            const popup = context.popup.value;
                            if (
                                event.key === "Tab" &&
                                !event.shiftKey &&
                                open &&
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
