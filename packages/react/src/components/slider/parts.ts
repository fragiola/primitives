import { SliderControl } from "./slider-control.tsx";
import { SliderIndicator } from "./slider-indicator.tsx";
import { SliderLabel } from "./slider-label.tsx";
import { SliderRoot } from "./slider-root.tsx";
import { SliderThumb } from "./slider-thumb.tsx";
import { SliderTrack } from "./slider-track.tsx";
import { SliderValue } from "./slider-value.tsx";

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
