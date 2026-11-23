# Calendar systems

## Purpose

Every date component can show and edit dates in a non-Gregorian **calendar system**: the
Persian, Islamic, Hebrew, Japanese, Buddhist, ... calendars of the catalog (`docs/catalog.md` §2
"Date and time", the mechanism "Segment editing and calendar systems"). The system is a
**presentation and arithmetic option**: values stay ISO (`PlainDate`, the Gregorian calendar of
ISO 8601) and forms submit ISO, so an app's data never depends on the calendar a user reads.

**Scope: stage 3** (Epic #82, Issue #80). The maintainer decided (2026-11-23) that dates, calendar
systems and time zones are written **in-house on `Intl`, with no date library** (AGENTS.md rule
2: `@floating-ui/dom` stays the only runtime dependency). The APG and Base UI say nothing about
calendar systems; `@internationalized/date` (React Aria) and Zag's `date-utils` are behaviour
references for eras and leap months only (nothing copied or installed).

## Systems

`@fragiola/primitives/calendar-systems` (a toolkit entry of its own) exports **one object per
system**, each importable alone:

| export | `Intl` id | months | eras |
| --- | --- | --- | --- |
| `gregory` | `gregory` | 12 | BC, AD |
| `buddhist` | `buddhist` | 12 (ISO's) | BE (the ISO year + 543) |
| `japanese` | `japanese` | 12 (ISO's) | Meiji, Taishō, Shōwa, Heisei, Reiwa |
| `roc` | `roc` | 12 (ISO's) | before R.O.C., Minguo (the ISO year − 1911) |
| `persian` | `persian` | 12 | AP |
| `indian` | `indian` | 12 | Saka |
| `islamicCivil` | `islamic-civil` | 12 | AH |
| `islamicTbla` | `islamic-tbla` | 12 | AH |
| `islamicUmalqura` | `islamic-umalqura` | 12 | AH |
| `hebrew` | `hebrew` | 12, or 13 in a leap year (Adar I) | AM |
| `coptic` | `coptic` | 13 (the 13th of 5 or 6 days) | AM |
| `ethiopic` | `ethiopic` | 13 | Amete Mihret |
| `ethioaa` | `ethioaa` | 13 | Amete Alem |

A **`CalendarSystem`** works on ISO dates: `fields(date)` (`{ era, eraYear, year, month, day }`:
`year` the system's arithmetic year, `month` its place in the year), `fromFields` (a month or day
past its end is clamped, Temporal's `constrain`), `monthsInYear`, `daysInMonth`, the calendars'
month math (`startOfMonth`, `endOfMonth`, `addMonths`, `addYears`, `monthsBetween`,
`isSameMonth`, `monthGrid`, `keyTarget`), the month and year calendars' items (`units`), the
eras (`eraCount`, `yearOfEra`, `eraName`) and its names (`locale(locale)` adds `-u-ca-<id>`;
`format`, `formatRange`).

### How a system is computed

**ICU does the math; the toolkit probes it.** The four ISO-based systems (`gregory`, `buddhist`,
`roc`, `japanese`) are the ISO calendar with a shifted year; the Japanese eras' first days are
read once from `Intl` (each year's last day's era, a change searched by halves). The other nine
are read from `Intl.DateTimeFormat#formatToParts` in the system (`en`, Latin digits, UTC): a day's
year and day of the month; a month starts on its day 1 and a year on its first month; each year's
month starts are found once and cached. A month's serial number (`monthIndex`) uses the system's
rule: 12 or 13 months a year, or the Hebrew 19-year cycle (`⌊(235 × year − 234) / 19⌋` months
before a year). **No data table** ships: the only constants are the ISO-based systems' offsets,
the Hebrew cycle and the Ethiopic Amete Alem offset (5500 years), each part of the calendar's
definition.

A **leap month** keeps its place when a date moves by years (Temporal's month code): Adar I of a
leap year goes to Adar of a common year, Adar II to Adar, and Adar I to Adar I between leap years.

## API

Every date component takes **`calendar`**, a `CalendarSystem` (React and Vue props, an Angular
input), and **injects** it: no component imports `/calendar-systems`, so an app that passes none
bundles none of its code (the bundle guard's `MECHANISM_USERS` lists no entry for it).

```tsx
import { persian } from "@fragiola/primitives/calendar-systems";
<Calendar.Root calendar={persian} locale="fa-IR" />
```

| component | what the system changes |
| --- | --- |
| Calendar, RangeCalendar, MultipleCalendar, CalendarPreset | the grid shows the system's months (a month starts on its day 1), the heading and cells its names (a cell named by its weekday, day, month and year, explicit `Intl` fields); PageUp / PageDown (Shift: a year) move by its months and years |
| DatePicker, DateRangePicker | passed to the bound calendar, as `min` and `max` are |
| MonthCalendar, MonthRangeCalendar, YearCalendar, YearRangeCalendar | the items are its months (**a page is one of its years: 12 or 13 months**) or its years (pages of 12 from a multiple of 12); the names are its own |
| MonthPicker, MonthRangePicker, YearPicker, YearRangePicker | passed to the bound calendar; the values are its months or years |
| CalendarView | the month and year views of a calendar in a system are the system's |
| DateField, DateRangeField, DatePickerInput, DateRangePickerInput | the segments show and edit its fields: its year, its month (up to 13), its days; **an era segment is editable** where the system has several eras (Japanese, ROC, Gregorian, when the locale writes one) |

TimeField and TimeRangeField have no date: they take no `calendar`.

**The system carries the code it changes (Epic #88).** The shared parts call the injected object
through one optional hook per concern, never a branch of their own: the day calendars run on the
system's month math (`addMonths`, `monthGrid`, `keyTarget`, `fullDate`, ...) in place of the ISO
calendar's; the month and year calendars, their pickers and CalendarView on its `units(kind)`
(`index`, `page`, `today`, `nearest`, the names, the form's ISO text); the segments
(`/segments`) on its segment hooks (`segmentFormat`, `segmentRange`, `segmentSample`,
`segmentValuesOf`, `segmentsToDate`: the editable era, 13-month years, the system's fields). So an
app that passes no `calendar` pays only for the hook calls (`docs/size.md`, "Date budgets").

**The locale's `-u-ca-` keyword is honoured only through a calendar object.** A component never
maps a string to a system (it would bundle every system); with no `calendar`, a locale whose
calendar is not Gregorian (`fa-IR`, `th-TH`, `ar-SA`, or a `-u-ca-` keyword) keeps the ISO grid
and arithmetic with `Intl`'s names, as before this Epic. Passing `calendar={gregory}` gives a
Gregorian calendar in any locale; passing a system makes its names agree with its grid (the
component writes the system's `-u-ca-` into the locale it formats with).

## Values

- Day calendars, pickers and fields: **ISO `PlainDate` / `PlainDateTime`**, whatever the system;
  `min`, `max` and `isDateUnavailable` take ISO dates too. A form submits ISO (`2026-11-20`).
- Month and year calendars and pickers: a month or year **of the system**, `{ year, month }` or
  `{ year }` (the `PlainYearMonth` and `PlainYear` shapes, Epic #79, with the system's arithmetic
  year and month: Aban 1405 is `{ year: 1405, month: 8 }`); their `min`, `max` and
  `isUnavailable` too. A form submits the **ISO date of its first day with the system's
  annotation** (RFC 9557, Temporal's `toString` of a non-ISO month): `2026-10-23[u-ca=persian]`,
  a year `2026-03-21[u-ca=persian]`, a range `start/end`. With no system they stay `2026-11` and
  `2026`.

## In the fields

The segments come from `Intl.DateTimeFormat#formatToParts` in the locale with the system: their
order, their texts (a Hebrew month is written by name, even as `numeric`) and the locale's
digits. The values the segments hold are the system's fields:

- **Year**: the era's year where the era is edited (Reiwa 8), else the system's year (1405).
- **Month**: 1 to `monthsInYear` (13 in a Hebrew leap year, and always in Coptic and Ethiopic);
  with no year set, the system's longest year. A year change that leaves the month past the new
  year's months clamps it (Adar II of a leap year becomes the common year's last month).
- **Day**: 1 to the month's days; clamped when the month, year or era changes.
- **Era**: an APG `spinbutton` (values 0 to the eras' count − 1, `aria-valuetext` its name),
  stepped with the arrows, typed with the first letters of its name (as a day period), erased by
  Backspace. While it is a placeholder, a typed year counts in the current era. A system with one
  era (`persian`, `hebrew`, ...) shows it as text, not a segment.

The value is built from the fields once they are complete (`fromFields`), so it is an ISO date.

## Scenarios

The suite fixes today at **2026-11-20**. Each scenario takes its system from its locale's `-u-ca-`
keyword (the fixtures map it to the export; a component never does). Expected names, month
lengths and month starts are computed with `Intl` in the browser running the test, never written
in the test: engines differ in their ICU.

### `/calendar-systems/basic?locale=ja-JP-u-ca-japanese`

A Calendar (`calendar`, default value 2026-11-20, "Previous month", a Heading, "Next month", the
Grid), a DateField in a Field labelled **"Date"** (`calendar`, default value 2026-11-20) and a
MonthCalendar (`calendar`, default value the system's month of 2026-11-20, "Previous year",
Heading, "Next year"). Output: `date: <ISO>`, `field: <ISO>`, `month: <year>-<month>` (the
system's fields).

Checks:

1. The Calendar's grid is named by its heading, `Intl`'s month and year of 2026-11-20 in the
   locale; the selected cell is named by its weekday, day, month and year (`Intl`, explicit
   fields: see "Recorded limits") and reads its day.
2. The grid's enabled cells are the system's month: as many as its days, the first one its day 1.
3. Tab to the selected cell, PageDown: the focus moves to the same day of the system's next
   month (computed by walking `Intl`'s days); the heading names that month. Enter:
   `date: <that ISO date>`.
4. The DateField's segments read `Intl`'s parts of 2026-11-20 in the locale (its era, year,
   month and day); the era is a `spinbutton` (the Japanese calendar has several). ArrowDown on the
   era: `field: 1996-11-20` (Heisei 8).
5. ArrowUp on the day: `field: 2026-11-21`.
6. The MonthCalendar's grid is named by `Intl`'s year of the system year; it has 12 cells; the
   selected cell is named by the system month's month and year. ArrowRight, Enter:
   `month: <the next month>`.
7. Axe finds no violation.
8. Contract layer: every part carries its component's part attribute; the DateField's hidden input
   holds `2026-11-20`; no `"false"` state attribute.

### `/calendar-systems/basic?locale=fa-IR-u-ca-persian&dir=rtl`

The same page, Persian, right to left. As `/calendar-systems/basic?locale=ja-JP-u-ca-japanese`,
but no era segment (one era) and checks 4–5 read: ArrowUp on the day gives `field: 2026-11-21`
(29 Aban to 30 Aban); the month spinbutton's maximum is 12 and the day's the month's 30 days.

### `/calendar-systems/basic?locale=ar-SA-u-ca-islamic-umalqura&dir=rtl`

The same page, Umm al-Qura, right to left (the era is written, one era: no segment).

### `/calendar-systems/basic?locale=he-IL-u-ca-hebrew&dir=rtl`

The same page, Hebrew, right to left: 5787 is a **leap year**, so the month spinbutton's maximum
is 13 and the MonthCalendar shows **13 cells** (Adar I and Adar II).

### `/calendar-systems/basic?locale=th-TH-u-ca-buddhist`

The same page, Buddhist (the year 2569).

### `/calendar-systems/pickers?locale=ja-JP-u-ca-japanese`

A form with, all with `calendar`: a DatePickerInput in a Field labelled **"Date"** (`name`
`date`, default value 2026-11-20, a Trigger "Choose date" opening a Calendar), a DateRangePicker
(`name` `stay`, a Trigger "Stay" opening a RangeCalendar), a MonthPicker (`name` `month`, Trigger
"Month", a MonthCalendar) and a YearPicker (`name` `year`, Trigger "Year", a YearCalendar), and a
"Submit" button. Output: `form: <the form's entries>`.

Checks:

1. "Choose date": the popup's grid is named by `Intl`'s month and year of 2026-11-20; 2026-11-20
   has the focus. PageDown, Enter: the popup closes; the segments read the chosen date's `Intl`
   parts.
2. "Stay": Enter on the focused 2026-11-20, ArrowRight three times, Enter: the popup closes.
3. "Month": the focused cell is named by the system month of 2026-11-20; Enter.
4. "Year": the focused cell reads `Intl`'s year of 2026-11-20; Enter.
5. Submit: `date=<the chosen ISO date>&stay=2026-11-20/2026-11-23&month=<ISO first day>[u-ca=<id>]&year=<ISO first day>[u-ca=<id>]`
   (the first days computed by walking `Intl`'s days back).
6. Axe finds no violation, the popups open and closed.

### `/calendar-systems/pickers?locale=fa-IR-u-ca-persian&dir=rtl`

As `/calendar-systems/pickers?locale=ja-JP-u-ca-japanese`, Persian, right to left.

### `/calendar-systems/pickers?locale=ar-SA-u-ca-islamic-umalqura&dir=rtl`

As above, Umm al-Qura, right to left.

### `/calendar-systems/pickers?locale=he-IL-u-ca-hebrew&dir=rtl`

As above, Hebrew, right to left.

### `/calendar-systems/pickers?locale=th-TH-u-ca-buddhist`

As above, Buddhist.

## Recorded limits

- **Engines**: a system is only as good as the engine's ICU. Chromium (the CI's browser) and
  Node 24+ have the 13 systems; the unit tests check that `Intl` resolves each one. An engine
  that lacks one falls back to its default calendar for that locale: no data table is shipped to
  work around it.
- **Chromium has no Hebrew-calendar date styles in Hebrew** (its trimmed ICU): `dateStyle:
  "full"` in `he-IL-u-ca-hebrew` writes `57870310 12:00 AM` (Node writes
  `יום שישי, י׳ בכסלו תשפ״ז`), which also failed axe's `label-content-name-mismatch` and would
  differ between a server render and its hydration. So a day cell in a calendar system is named
  with **explicit fields** (`weekday: "long"`, `year`, `month: "long"`, `day`), which both engines
  write alike (`יום שישי, 10 בכסלו 5787`); with no system the cell keeps `dateStyle: "full"`. The
  other formats the components use agree between Node and Chromium in the five scenario locales
  (checked when this Epic was written; spaces aside, which are normalised).
- **Range**: the systems are tested day by day from 1900 to 2100. The ISO-based systems before
  1582-10-15 differ from ICU's (ICU writes Julian dates there; the toolkit computes proleptic
  Gregorian ones). The Japanese eras start at Meiji (1868): an earlier date counts in Meiji's
  years (zero or less). A date before a system's era counts its years down from 1 (Ethiopic: in
  Amete Alem's, 5500 earlier).
- **A Japanese year is typed in full** (`8` waits for more digits, as a Gregorian year: Tab moves
  on), and an era's year past the era's end is not clamped to it (Heisei 40 is 2028, shown as
  Reiwa).
- **A Hebrew month keeps its number** when a typed year moves between a leap and a common year
  (the 7th month is Adar II in a leap year, Nisan in a common one); the calendars' Page Up / Down
  keep its month code instead.

## Differences from React Aria

- A **calendar object**, not an identifier string (React Aria's `createCalendar` maps an id to
  every system: an app would bundle all of them).
- **Values stay ISO** (React Aria returns a `CalendarDate` in the system): an app's data and its
  forms never depend on the calendar shown.
- Months and years of the month and year pickers are **the system's**, submitted as the ISO date
  of their first day with the RFC 9557 annotation.
