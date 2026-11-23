import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    NumberFieldContext,
    type NumberFieldState,
    numberFieldState,
} from "./number-field-context.ts";
import { useStepperButton } from "./use-stepper-button.ts";

export type NumberFieldDecrementProps = PartProps<NumberFieldState>;

/**
 * Steps the value down, once or held (spec/number-field.md, "Pointer"); out of the tab order, its
 * name the consumer's.
 */
export function NumberFieldDecrement(props: NumberFieldDecrementProps) {
    const context = useRequiredContext(
        NumberFieldContext,
        "NumberField.Decrement",
    );
    const button = useStepperButton(context, -1);
    return renderElement(
        "button",
        props,
        numberFieldState(context),
        {
            type: "button",
            tabIndex: -1,
            disabled: button.disabled,
            "aria-controls": context.inputId,
            "data-primitives-part": "number-field-decrement",
            ...context.attributes,
        },
        button.ref,
    );
}
