// The entry of @fragiola/primitives/range: range math (snapping, fractions, thumbs), the slider key map, a progress's value and a rating's steps.

export {
    type ProgressOptions,
    type ProgressStatus,
    type ProgressValue,
    progressValue,
} from "./progress.ts";
export {
    fractionAlong,
    moveThumb,
    nearestThumb,
    type RangeOptions,
    snapToStep,
    type ThumbOptions,
    thumbBounds,
    valueAtFraction,
    valueToPercent,
} from "./range-math.ts";
export {
    type RatingItemState,
    type RatingKeyOptions,
    ratingItemState,
    ratingKeyTarget,
    ratingValueAt,
} from "./rating.ts";
export { type SliderKeyOptions, sliderKeyTarget } from "./slider-keys.ts";
