---
"@fragiola/primitives": patch
"@fragiola/primitives-react": patch
"@fragiola/primitives-vue": patch
"@fragiola/primitives-angular": patch
---

The date family is smaller for an app that passes no `calendar` and no `timeZone`, with no behaviour change: the calendar systems and time zones carry the code they change, and the shared calendar, field and segment code calls one optional hook per concern. `/segments` is 427 B (min + gzip) smaller than after the calendar systems, every segmented field about 400 B, the React and Vue month and year pickers about 550 B, CalendarView about 300 B. `CalendarSystem` gains its segment hooks (`segmentFormat`, `segmentRange`, `segmentSample`, `segmentValuesOf`, `segmentsToDate`), `CalendarUnits` gains `page`, `today` and `nearest`, `TimeZone` gains `choose`, `wallTime`, `segmentOptions`, `segmentText` and `segmentsToDateTime`. Angular's `/month-calendar` no longer exports `ISO_UNITS` (use `unitsOf`). `pnpm size` budgets every date entry (`docs/size.md`, "Date budgets").
