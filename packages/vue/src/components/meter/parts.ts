import { MeterIndicator } from "./meter-indicator.ts";
import { MeterLabel } from "./meter-label.ts";
import { MeterRoot } from "./meter-root.ts";
import { MeterTrack } from "./meter-track.ts";
import { MeterValue } from "./meter-value.ts";

/** spec/meter.md */
export const Meter = {
    Root: MeterRoot,
    Label: MeterLabel,
    Value: MeterValue,
    Track: MeterTrack,
    Indicator: MeterIndicator,
};
