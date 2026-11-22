import { useContext, useMemo, useState } from "react";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { FieldsetContext } from "../field/fieldset-context.ts";

export interface FieldsetState {
    disabled: boolean;
}

export interface FieldsetRootProps extends PartProps<FieldsetState> {
    /** Disables the fieldset and every field inside it (a parent Fieldset's `disabled` too). */
    disabled?: boolean;
}

/** A native `fieldset`, a `group` named by its Legend, that disables its fields (spec/fieldset.md). */
export function FieldsetRoot({
    disabled: disabledProp = false,
    ...props
}: FieldsetRootProps) {
    const parent = useContext(FieldsetContext);
    const disabled = disabledProp || (parent?.disabled ?? false);
    const [legendId, setLegendId] = useState<string>();
    const context = useMemo(() => ({ disabled, setLegendId }), [disabled]);
    const state = { disabled };
    return (
        <FieldsetContext.Provider value={context}>
            {renderElement("fieldset", props, state, {
                "aria-labelledby": legendId,
                disabled,
                "data-primitives-part": "fieldset-root",
                ...stateAttributes({ disabled }),
            })}
        </FieldsetContext.Provider>
    );
}
