import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { MeterContext, type MeterState, meterState } from "./meter-context.ts";

export type MeterTrackProps = PartProps<MeterState>;

/** The rail the Indicator fills (spec/meter.md). */
export function MeterTrack(props: MeterTrackProps) {
    const context = useRequiredContext(MeterContext, "Meter.Track");
    return renderElement("div", props, meterState(context), {
        "data-primitives-part": "meter-track",
    });
}
