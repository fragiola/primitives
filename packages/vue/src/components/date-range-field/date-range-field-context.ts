import type { InjectionKey } from "vue";
import type { DateFieldContext } from "../date-field/date-field-context.ts";

/** One end of a range: the Input that holds its segments (spec/date-range-field.md). */
export type RangeEnd = "start" | "end";

/**
 * What a range's Inputs read: each end's group, as a DateField's context (so DateField's Input
 * and Segment render it). Provided by the range fields and the range picker's typed input.
 */
export interface DateRangeFieldContext {
    groups: Readonly<Record<RangeEnd, DateFieldContext>>;
}

export const DateRangeFieldKey: InjectionKey<DateRangeFieldContext> =
    Symbol("DateRangeField");
