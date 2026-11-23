import type { CSSProperties } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { MeterContext, type MeterState, meterState } from "./meter-context.ts";

export type MeterIndicatorProps = PartProps<MeterState>;

/**
 * The filled part, from the inline start (spec/meter.md): its structural style sets its inline
 * size, and `--meter-indicator-size`.
 */
export function MeterIndicator(props: MeterIndicatorProps) {
    const context = useRequiredContext(MeterContext, "Meter.Indicator");
    const style = {
        insetInlineStart: 0,
        inlineSize: `${context.percent}%`,
        "--meter-indicator-size": `${context.percent}%`,
    } as CSSProperties;
    return renderElement("div", props, meterState(context), {
        style,
        "data-primitives-part": "meter-indicator",
    });
}
