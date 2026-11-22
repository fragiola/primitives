import type { FieldState } from "@fragiola/primitives/form";
import { fieldStateAttributes } from "@fragiola/primitives/form";
import { type MouseEvent, useId, useLayoutEffect } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { FieldContext } from "./field-context.ts";

export interface FieldLabelProps extends PartProps<FieldState> {
    id?: string;
}

/** Names the field's control: `for` a labelable control, `aria-labelledby` on any (spec/field.md). */
export function FieldLabel({ id: idProp, ...props }: FieldLabelProps) {
    const field = useRequiredContext(FieldContext, "Field.Label");
    const generated = useId();
    const id = idProp ?? generated;
    const { setLabelId } = field;
    useLayoutEffect(() => {
        setLabelId(id);
        return () => setLabelId(undefined);
    }, [id, setLabelId]);
    const { control } = field;
    return renderElement("label", props, field.state, {
        id,
        htmlFor: control?.labelable ? control.id : undefined,
        onClick: (event: MouseEvent<HTMLElement>) => {
            if (!control?.labelFocuses || event.defaultPrevented) {
                return;
            }
            // no click on the control, only its focus (spec/field.md, "Focus")
            event.preventDefault();
            event.currentTarget.ownerDocument
                .getElementById(control.id)
                ?.focus();
        },
        "data-primitives-part": "field-label",
        ...stateAttributes(fieldStateAttributes(field.state)),
    });
}
