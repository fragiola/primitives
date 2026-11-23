import type { SegmentMove } from "./segment-focus.ts";
import type { EditableSegmentType, SegmentFormat } from "./segment-format.ts";
import { eraseSegment, type SegmentEdit } from "./segment-typing.ts";
import {
    SEGMENT_PAGE_STEPS,
    type SegmentValues,
    segmentToEdge,
    stepSegment,
} from "./segment-values.ts";

export interface SegmentKeyResult {
    /** `step` (the arrows, Page Up and Down, Home, End), `erase` (Backspace, Delete) or `move`. */
    readonly kind: "step" | "erase" | "move";
    readonly values: SegmentValues;
    readonly edit: SegmentEdit | null;
    /** Where the focus goes, if anywhere. */
    readonly move: SegmentMove | null;
}

/**
 * The effect of a key on a focused segment (spec/date-field.md, "Keyboard", the APG spinbutton):
 * ArrowUp / ArrowDown step by one, Page Up / Page Down by the segment's page step, both wrapping
 * within the segment; Home / End go to its minimum / maximum; ArrowLeft / ArrowRight move to the
 * segment on that side; Backspace and Delete erase a digit, or move back from an empty segment.
 * `null` for any other key. A read-only field only moves.
 */
export function segmentKeyDown(
    format: SegmentFormat,
    values: SegmentValues,
    type: EditableSegmentType,
    key: string,
    edit: SegmentEdit | null,
    options: {
        readonly seed?: SegmentValues;
        readonly readOnly?: boolean;
    } = {},
): SegmentKeyResult | null {
    const { seed = {}, readOnly = false } = options;
    if (key === "ArrowLeft" || key === "ArrowRight") {
        return {
            kind: "move",
            values,
            edit: null,
            move: key === "ArrowLeft" ? "left" : "right",
        };
    }
    if (readOnly) {
        return null;
    }
    const step = (amount: number): SegmentKeyResult => ({
        kind: "step",
        values: stepSegment(format, values, type, amount, seed),
        edit: null,
        move: null,
    });
    const page = SEGMENT_PAGE_STEPS[type];
    switch (key) {
        case "ArrowUp":
            return step(1);
        case "ArrowDown":
            return step(-1);
        case "PageUp":
            return step(page);
        case "PageDown":
            return step(-page);
        case "Home":
        case "End":
            return {
                kind: "step",
                values: segmentToEdge(
                    format,
                    values,
                    type,
                    key === "Home" ? "min" : "max",
                    seed,
                ),
                edit: null,
                move: null,
            };
        case "Backspace":
        case "Delete": {
            const result = eraseSegment(format, values, type, edit);
            return {
                kind: "erase",
                values: result.values,
                edit: result.edit,
                move: result.retreat ? "previous" : null,
            };
        }
        default:
            return null;
    }
}
