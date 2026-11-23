// The entry of @fragiola/primitives-angular/calendar-preset: a button that sets a calendar's value
// to a known date or range (spec/calendar.md, "Presets"), inside any `[calendarRoot]` or
// `[rangeCalendarRoot]`, inline or in a picker. In an entry of its own, so the calendars and
// pickers without presets are unchanged (D8).

export type { DateRange, PlainDate } from "@fragiola/primitives/date";
export {
    CalendarPreset,
    type CalendarPresetState,
    type CalendarPresetValue,
} from "./directives/calendar-preset.directive.ts";
