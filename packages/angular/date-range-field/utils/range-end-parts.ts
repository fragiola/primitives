import {
    InjectionToken,
    type Signal,
    type WritableSignal,
} from "@angular/core";
import type { DateSegment } from "@fragiola/primitives/segments";
import type {
    DateFieldData,
    DateFieldParts,
    DateFieldState,
    SegmentGroup,
} from "@fragiola/primitives-angular/date-field";
import type { FieldControlBinding } from "@fragiola/primitives-angular/field";
import type { RangeEnd } from "./field-range.ts";

/**
 * What a range's Inputs read: each end's group of segments. Provided by the range fields and the
 * range picker's typed input (spec/date-range-field.md, spec/calendar.md "Typed input").
 */
export interface RangeGroups {
    group(end: RangeEnd): SegmentGroup;
}

/** The enclosing range's ends, for its Inputs. */
export const DATE_RANGE_FIELD = new InjectionToken<RangeGroups>(
    "DATE_RANGE_FIELD",
);

/**
 * One end of a range as DateField's parts read it (`DATE_FIELD`), provided by its Input: every
 * member is the end's group's, read when used (the Input's `range` is set after it is made), but
 * the segments' `aria-labelledby` prefix, the Input's own (the Field's label and the Input).
 */
export class RangeEndParts implements DateFieldParts {
    constructor(
        private readonly groups: RangeGroups,
        private readonly end: () => RangeEnd,
        readonly labelledBy: Signal<string | null>,
    ) {}

    private get group(): SegmentGroup {
        return this.groups.group(this.end());
    }

    part(name: string): string {
        return this.group.part(name);
    }

    get segments(): Signal<DateSegment[]> {
        return this.group.segments;
    }

    get state(): Signal<DateFieldState> {
        return this.group.state;
    }

    get data(): Signal<DateFieldData> {
        return this.group.data;
    }

    get disabled(): Signal<boolean> {
        return this.group.disabled;
    }

    get readOnly(): Signal<boolean> {
        return this.group.readOnly;
    }

    get required(): Signal<boolean> {
        return this.group.required;
    }

    get invalid(): Signal<boolean> {
        return this.group.invalid;
    }

    get inputElement(): WritableSignal<HTMLElement | null> {
        return this.group.inputElement;
    }

    get field(): FieldControlBinding {
        return this.group.field;
    }

    segmentKey(
        segment: DateSegment,
        event: KeyboardEvent,
        element: HTMLElement,
    ): boolean {
        return this.group.segmentKey(segment, event, element);
    }

    segmentText(
        segment: DateSegment,
        text: string,
        event: Event,
        element: HTMLElement,
    ): void {
        this.group.segmentText(segment, text, event, element);
    }

    segmentBlur(segment: DateSegment, event: FocusEvent): void {
        this.group.segmentBlur(segment, event);
    }
}
