---
"@fragiola/primitives": minor
"@fragiola/primitives-react": minor
"@fragiola/primitives-vue": minor
"@fragiola/primitives-angular": minor
---

Calendar systems and time zones, computed in-house on `Intl`, natively in React, Vue and Angular. The toolkit gains `/calendar-systems`: the 13 systems of the catalog (`gregory`, `buddhist`, `japanese`, `roc`, `persian`, `indian`, `islamicCivil`, `islamicTbla`, `islamicUmalqura`, `hebrew`, `coptic`, `ethiopic`, `ethioaa`), one export each, with their fields, eras, leap months, month and year math and names. Every date component takes an injected `calendar` (`calendar={persian}`): the day calendars, pickers, month and year calendars and pickers, CalendarView and the date fields show and edit the system's months, years and eras (an editable era segment where the system has several, 13-month years); values stay ISO, and a month or year picker in a system submits its first day's ISO date with the RFC 9557 annotation (`2026-10-23[u-ca=persian]`). The toolkit gains `/time-zone`: `ZonedDateTime`, the offset lookup, instants, DST gaps and overlaps with Temporal's `disambiguation`, zoned math, RFC 9557 ISO text and `timeZone(id)`. DateField, DateRangeField, DatePickerInput and DateRangePickerInput take `timeZone`, `hideTimeZone` and `disambiguation`: zoned values, a time zone name segment, the typed wall time resolved in the zone, the zoned ISO text submitted. No component imports either entry, so an app that passes no calendar and no zone bundles none of their code.
