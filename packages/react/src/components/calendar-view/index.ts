// The entry of @fragiola/primitives-react/calendar-view: a calendar's day, month and year views
// (spec/month-calendar.md, "Views"), inside a Calendar, RangeCalendar or MultipleCalendar, inline
// or in a picker; a MonthCalendar or YearCalendar without a value binds to it. In an entry of its
// own, so the calendars and pickers without views are unchanged (D8). It exports the Calendar's
// and the MonthCalendar's namespaces too, so their modules stay in one chunk of the build.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export { Calendar } from "../calendar/parts.ts";
export { MonthCalendar } from "../month-calendar/parts.ts";
export type { CalendarViewName } from "./calendar-view-context.ts";
export type {
    CalendarViewRootProps,
    CalendarViewState,
} from "./calendar-view-root.tsx";
export type {
    CalendarViewTriggerProps,
    CalendarViewTriggerState,
} from "./calendar-view-trigger.tsx";
export { CalendarView } from "./parts.ts";
