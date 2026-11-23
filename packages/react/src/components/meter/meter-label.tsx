import { useId, useLayoutEffect } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { MeterContext, type MeterState, meterState } from "./meter-context.ts";

export interface MeterLabelProps extends PartProps<MeterState> {
    id?: string;
}

/** Names the meter (`aria-labelledby`, spec/meter.md). */
export function MeterLabel({ id: idProp, ...props }: MeterLabelProps) {
    const context = useRequiredContext(MeterContext, "Meter.Label");
    const generated = useId();
    const id = idProp ?? generated;
    const { setLabelId } = context;
    useLayoutEffect(() => {
        setLabelId(id);
        return () => setLabelId(undefined);
    }, [id, setLabelId]);
    return renderElement("span", props, meterState(context), {
        id,
        "data-primitives-part": "meter-label",
    });
}
