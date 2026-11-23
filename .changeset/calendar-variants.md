---
"@fragiola/primitives": minor
"@fragiola/primitives-react": minor
"@fragiola/primitives-vue": minor
"@fragiola/primitives-angular": minor
---

The calendar variants, natively in React, Vue and Angular, each in its own entry. `/multiple-calendar` (`MultipleCalendar`, the Calendar's parts): several dates (`PlainDate[]`, sorted), a press or Enter / Space toggles a date, `maxSelected`, `aria-multiselectable`, one hidden input per date with `name`, form reset. `/calendar-preset` (`CalendarPreset`): a button that sets a Calendar's or RangeCalendar's value to a date, a range or a function of today (reason `item-press`), inline or in any picker (a typed picker's segments follow), `data-selected` while current, disabled when out of reach. `/month-calendar`, `/month-range-calendar`, `/year-calendar`, `/year-range-calendar`: APG grids of the 12 months of a year and of pages of 12 years, the calendar's keys mapped to them, `min`, `max`, `isUnavailable`, `columns`, a range mode, `PlainYearMonth` / `PlainYear` values. `/month-picker`, `/month-range-picker`, `/year-picker`, `/year-range-picker`: the DatePicker's parts with a month or year value, submitting `2026-11`, `2026-03/2026-06`, `2026`, `2020/2024`. `/calendar-view` (`CalendarView`: `Root`, `Trigger`): a calendar's day, month and year views, inline or in a picker's popup, the new view's focused cell taking the focus on each switch. The toolkit gains `/month-year` (the month and year values, the 12-item grid and its keys, their `Intl` names). Every existing entry is unchanged.
