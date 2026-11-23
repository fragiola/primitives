// The entry of @fragiola/primitives-vue/calendar-preset: a button that sets a calendar's value to a
// known date or range (spec/calendar.md, "Presets"), inside any Calendar or RangeCalendar, inline
// or in a picker. In an entry of its own, so the calendars and pickers without presets are
// unchanged (D8).
// It exports the Calendar's namespace too (an app imports both from one entry), so the calendar's
// modules stay in one chunk of the build and `/calendar` and `/range-calendar` are unchanged.

export type { DateRange, PlainDate } from "@fragiola/primitives/date";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { Calendar } from "../calendar/parts.ts";
export {
    CalendarPreset,
    type CalendarPresetProps,
    type CalendarPresetState,
    type CalendarPresetValue,
} from "./calendar-preset.ts";
