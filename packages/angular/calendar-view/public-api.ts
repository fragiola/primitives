// The entry of @fragiola/primitives-angular/calendar-view: a calendar's day, month and year views
// (spec/month-calendar.md, "Views"), inside a `[calendarRoot]`, `[rangeCalendarRoot]` or
// `[multipleCalendarRoot]`, inline or in a picker; a `[monthCalendarRoot]` or `[yearCalendarRoot]`
// without a value binds to it. In an entry of its own, so the calendars and pickers without views
// are unchanged (D8).

export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { CalendarViewRoot } from "./directives/calendar-view-root.directive.ts";
export {
    CalendarViewTrigger,
    type CalendarViewTriggerState,
} from "./directives/calendar-view-trigger.directive.ts";
export {
    CALENDAR_VIEW,
    type CalendarViewContext,
    type CalendarViewName,
} from "./utils/calendar-view-context.ts";
