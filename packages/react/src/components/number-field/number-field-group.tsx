import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    NumberFieldContext,
    type NumberFieldState,
    numberFieldState,
} from "./number-field-context.ts";

export type NumberFieldGroupProps = PartProps<NumberFieldState>;

/** Groups the Input with its buttons (`role="group"`, spec/number-field.md). */
export function NumberFieldGroup(props: NumberFieldGroupProps) {
    const context = useRequiredContext(NumberFieldContext, "NumberField.Group");
    return renderElement("div", props, numberFieldState(context), {
        role: "group",
        "data-primitives-part": "number-field-group",
        ...context.attributes,
    });
}
