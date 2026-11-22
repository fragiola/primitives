import { useId, useLayoutEffect } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { FieldsetContext } from "../field/fieldset-context.ts";
import type { FieldsetState } from "./fieldset-root.tsx";

export interface FieldsetLegendProps extends PartProps<FieldsetState> {
    id?: string;
}

/** Names its Fieldset (`aria-labelledby`): a `div`, not a native `legend` (spec/fieldset.md). */
export function FieldsetLegend({ id: idProp, ...props }: FieldsetLegendProps) {
    const fieldset = useRequiredContext(FieldsetContext, "Fieldset.Legend");
    const generated = useId();
    const id = idProp ?? generated;
    const { setLegendId, disabled } = fieldset;
    useLayoutEffect(() => {
        setLegendId(id);
        return () => setLegendId(undefined);
    }, [id, setLegendId]);
    return renderElement(
        "div",
        props,
        { disabled },
        {
            id,
            "data-primitives-part": "fieldset-legend",
            ...stateAttributes({ disabled }),
        },
    );
}
