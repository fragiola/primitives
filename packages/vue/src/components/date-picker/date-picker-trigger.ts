import { defineComponent } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { DatePickerKey } from "./date-picker-context.ts";

export interface DatePickerTriggerState {
    open: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

export type DatePickerTriggerProps = Record<never, never>;

/**
 * Opens the picker; its content is the consumer's (for example the formatted value). Inside a
 * Field, the field's labelable control (spec/field.md).
 */
export const DatePickerTrigger: PartComponent<
    DatePickerTriggerProps,
    DatePickerTriggerState
> = publicComponent(
    defineComponent({
        name: "DatePickerTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                DatePickerKey,
                "DatePicker.Trigger",
            );
            const setTrigger = elementSetter(context.trigger);
            const { field } = context;
            return () => {
                const open = context.open.value;
                const disabled = context.disabled();
                const readOnly = context.readOnly();
                const required = context.required();
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    { open, disabled, readOnly, required },
                    {
                        type: "button",
                        id: context.triggerId,
                        disabled,
                        "aria-haspopup": "dialog",
                        "aria-expanded": open ? "true" : "false",
                        "aria-controls": open ? context.popupId : undefined,
                        ...field.aria(),
                        "data-primitives-part": `${context.component}-trigger`,
                        ...field.attributes(),
                        ...stateAttributes({
                            "popup-open": open,
                            disabled,
                            readonly: readOnly,
                            required,
                        }),
                        onClick: (event: MouseEvent) => {
                            if (!context.disabled()) {
                                context.setOpen(!open, "trigger-press", event);
                            }
                        },
                        onFocus: field.onFocus,
                        onBlur: field.onBlur,
                        ref: setTrigger,
                    },
                );
            };
        },
    }),
);
