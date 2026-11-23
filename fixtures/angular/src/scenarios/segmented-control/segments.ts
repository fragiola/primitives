import {
    SegmentedControlIndicator,
    SegmentedControlItem,
    SegmentedControlItemText,
    SegmentedControlRoot,
} from "@fragiola/primitives-angular/segmented-control";

/** Every SegmentedControl directive, for a scenario's `imports`. */
export const SEGMENTED_CONTROL_PARTS = [
    SegmentedControlRoot,
    SegmentedControlItem,
    SegmentedControlItemText,
    SegmentedControlIndicator,
] as const;

/**
 * A scenario's Items (`segments` names the array in the component) and its Indicator after them,
 * as React's: each Item holds an ItemText with its label (one text node). `indicator` is the
 * Indicator's structural expression (`"true"` for `renderBeforeHydration`).
 */
export function segments(segments: string, indicator = ""): string {
    return `@for (segment of ${segments}; track segment.value) {<button segmentedControlItem [value]="segment.value" [disabled]="segment.disabled ?? false" [class]="styles.item"><span segmentedControlItemText [class]="styles['item-text']">{{ segment.label }}</span></button>}<span *segmentedControlIndicator${indicator === "" ? "" : `="${indicator}"`} [class]="styles.indicator"></span>`;
}
