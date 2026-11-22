import { SliderControl } from "./slider-control.ts";
import { SliderIndicator } from "./slider-indicator.ts";
import { SliderLabel } from "./slider-label.ts";
import { SliderRoot } from "./slider-root.ts";
import { SliderThumb } from "./slider-thumb.ts";
import { SliderTrack } from "./slider-track.ts";
import { SliderValue } from "./slider-value.ts";

/** spec/slider.md */
export const Slider = {
    Root: SliderRoot,
    Label: SliderLabel,
    Value: SliderValue,
    Control: SliderControl,
    Track: SliderTrack,
    Indicator: SliderIndicator,
    Thumb: SliderThumb,
};
