---
"@fragiola/primitives-react": minor
"@fragiola/primitives-vue": minor
"@fragiola/primitives-angular": minor
---

Calendar, RangeCalendar, DatePicker and DateRangePicker, natively in React, Vue and Angular, one entry each (`/calendar`, `/range-calendar`, `/date-picker`, `/date-range-picker`) over shared modules: a month grid with the APG date grid's keyboard (Home and End by week, Page Up and Page Down by month, with Shift by year), `min`, `max`, unavailable dates, several visible months, the locale's names and first weekday from `Intl`, and plain `{ year, month, day }` dates with no time zone. A RangeCalendar previews the range being chosen and swaps a reversed one. The pickers are non-modal popups holding a bound calendar: they open on the value, close on a choice and return focus to the trigger (`data-popup-open` on it). Every part carries `data-primitives-part`, `calendar-*` or `range-calendar-*`, `date-picker-*` or `date-range-picker-*`, by its root.
