import type { ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { MeterContext, type MeterState, meterState } from "./meter-context.ts";

export interface MeterValueProps
    extends Omit<PartProps<MeterState>, "children"> {
    /** Its content: a node, or a function of the formatted value and the value. */
    children?:
        | ReactNode
        | ((formattedValue: string, value: number) => ReactNode);
}

/** Shows the formatted value (spec/meter.md). */
export function MeterValue({ children, ...props }: MeterValueProps) {
    const context = useRequiredContext(MeterContext, "Meter.Value");
    const content =
        typeof children === "function"
            ? children(context.formattedValue, context.value)
            : (children ?? context.formattedValue);
    return renderElement(
        "span",
        { ...props, children: content },
        meterState(context),
        { "data-primitives-part": "meter-value" },
    );
}
