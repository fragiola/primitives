import type { DateSegment, SegmentFormat } from "@fragiola/primitives/segments";
import { createContext } from "react";
import type { FieldControlBinding } from "../../hooks/use-field-control.ts";

/** Which root the shared parts sit in: their part attribute names it (spec/date-field.md). */
export type DateFieldComponent = "date-field" | "time-field";

/** The state every part renders with (spec/date-field.md, "State attributes and ARIA"). */
export interface DateFieldState {
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    /** Out of range or unavailable, or the Field shows an error. */
    invalid: boolean;
}

/** A Segment's state: the field's, with its own type and placeholder state. */
export interface DateFieldSegmentState extends DateFieldState {
    type: DateSegment["type"];
    placeholder: boolean;
}

export interface DateFieldContextValue extends DateFieldState {
    component: DateFieldComponent;
    format: SegmentFormat;
    segments: DateSegment[];
    /** The Field's label id (the segments' `aria-labelledby` starts with it). */
    labelId: string | undefined;
    field: FieldControlBinding;
    /** The state attributes and the field's, for every part. */
    attributes: Record<`data-${string}`, string>;
    setInputElement: (element: HTMLElement | null) => void;
    /** A key on a segment: whether the field took it (its default is then prevented). */
    onSegmentKey: (
        segment: DateSegment,
        event: KeyboardEvent,
        element: HTMLElement,
    ) => boolean;
    /** Text typed into a segment (`beforeinput`'s data). */
    onSegmentText: (
        segment: DateSegment,
        text: string,
        event: Event,
        element: HTMLElement,
    ) => void;
    /** A segment lost the focus. */
    onSegmentBlur: (
        segment: DateSegment,
        event: FocusEvent,
        element: HTMLElement,
    ) => void;
}

export const DateFieldContext = createContext<DateFieldContextValue | null>(
    null,
);
