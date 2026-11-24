import { defineComponent } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ColorPickerPopoverKey } from "./color-picker-popover-context.ts";

export interface ColorPickerPopoverTriggerState {
    open: boolean;
    disabled: boolean;
}

export type ColorPickerPopoverTriggerProps = Record<never, never>;

/** Opens the picker's popup; its content is the app's (a ColorSwatch of the picker's color). */
export const ColorPickerPopoverTrigger: PartComponent<
    ColorPickerPopoverTriggerProps,
    ColorPickerPopoverTriggerState
> = publicComponent(
    defineComponent({
        name: "ColorPickerPopoverTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ColorPickerPopoverKey,
                "ColorPickerPopover.Trigger",
            );
            const setTrigger = elementSetter(context.trigger);
            return () => {
                const open = context.open.value;
                const disabled = context.disabled();
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    { open, disabled },
                    {
                        type: "button",
                        id: context.triggerId,
                        disabled,
                        "aria-haspopup": "dialog",
                        "aria-expanded": open ? "true" : "false",
                        "aria-controls": open ? context.popupId : undefined,
                        "data-primitives-part": "color-picker-popover-trigger",
                        ...stateAttributes({ "popup-open": open, disabled }),
                        onClick: (event: MouseEvent) => {
                            if (!context.disabled()) {
                                context.setOpen(!open, "trigger-press", event);
                            }
                        },
                        ref: setTrigger,
                    },
                );
            };
        },
    }),
);
