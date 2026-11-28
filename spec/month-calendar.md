# MonthCalendar, YearCalendar, their range variants and pickers, CalendarView

## Purpose

Epic #79, Issue #78 (Stage 3, `docs/handoff.md` §5):

- **MonthCalendar** / **MonthRangeCalendar**: a grid of the 12 months of a year, for choosing one
  month or a range of months (a card's expiry, a reporting period).
- **YearCalendar** / **YearRangeCalendar**: a grid of a page of 12 years, for choosing one year or
  a range of years (a year filter).
- **MonthPicker** / **MonthRangePicker** / **YearPicker** / **YearRangePicker**: a picker whose
  popup holds one of them: the DatePicker's trigger, popup and form, with a month or a year value.
- **CalendarView**: the **day, month and year views** of a calendar: a Calendar (or
  RangeCalendar) whose header switches its grid to the months of its year, then to a page of
  years, to move far quickly; inline, and inside the date pickers' popups.

The APG has no month or year grid: they are the **APG grid pattern** (as the Calendar's grid,
[calendar.md](calendar.md)), with the Calendar's keys mapped to months and years. Base UI has no
date component, so where the APG is silent the APG-closest option is taken, with Zag/Ark's date
picker views (`view`, `ViewTrigger`, the month and year tables) and React Aria and Bits UI as
behaviour references only (nothing copied); each choice is recorded below and in
`docs/decisions.md` (Epic #79).

## Values

A month is `PlainYearMonth` `{ year, month }` (`month` 1–12) and a year `PlainYear` `{ year }`,
plain values with no day, no time and no time zone, from the toolkit's
`@fragiola/primitives/month-year` (Temporal's `PlainYearMonth` shape; a year is an object, not a
number, so a calendar system can extend it, Epic 4). A range is `{ start, end }` with
`start <= end` (`YearMonthRange`, `YearRange`). Fixtures print them as ISO text: `2026-11`,
`2026`, `2026-03..2026-06`.

The alternative, a `PlainDate` on the first day (Issue #78's other option), is not taken: the
value would claim a day it does not have, and the form would submit `2026-11-01`.

## Anatomy

The four calendars share their parts, named by the root they sit in
(`month-calendar-<part>`, `month-range-calendar-<part>`, `year-calendar-<part>`,
`year-range-calendar-<part>`; spec/README.md, "Part attribute"):

| part | element | `data-primitives-part` (MonthCalendar) | notes |
| --- | --- | --- | --- |
| Root | `div` | `month-calendar-root` | holds the state |
| Heading | `h2` | `month-calendar-heading` | the year (MonthCalendar) or the page of years (YearCalendar) shown |
| PrevButton | `button` | `month-calendar-prev-button` | shows the previous page |
| NextButton | `button` | `month-calendar-next-button` | shows the next page |
| Grid | `table` | `month-calendar-grid` | the page |
| GridBody | `tbody` | `month-calendar-grid-body` | children function per row |
| Row | `tr` | `month-calendar-row` | one row; children function per item |
| Cell | `td` | `month-calendar-cell` | one month (one year) |

A **page** is 12 items: the months of one year, or 12 years starting at a multiple of 12 (2016 to
2027 holds 2026), so paging never shifts the rows. The rows hold `columns` items each (default 3:
4 rows).

The pickers' parts are the DatePicker's (Trigger, Portal, Positioner, Popup, the hidden input;
[calendar.md](calendar.md#anatomy)), named `month-picker-<part>`, `month-range-picker-<part>`,
`year-picker-<part>`, `year-range-picker-<part>`. A MonthCalendar (MonthRangeCalendar,
YearCalendar, YearRangeCalendar) rendered in the Popup of a picker of its kind without
`value` / `defaultValue` binds to it, as a Calendar binds to a DatePicker.

**Entries** (D8): one per component in every framework package: `/month-calendar`,
`/month-range-calendar`, `/year-calendar`, `/year-range-calendar`, `/month-picker`,
`/month-range-picker`, `/year-picker`, `/year-range-picker`, `/calendar-view`. The range and year
roots are built on `/month-calendar`'s state and parts, the pickers on `/date-picker`'s parts. Their
month and year math, keys and locale data are the toolkit's `@fragiola/primitives/month-year`,
which only these entries import: `/date` and every existing entry stay byte for byte.

## API

**MonthCalendar.Root** (YearCalendar.Root likewise, with years):

- `value`, `defaultValue` (`null`), `onValueChange(value, details)` (`PlainYearMonth | null`;
  reason `item-press`).
- `min`, `max` (`PlainYearMonth`; YearCalendar `PlainYear`): items outside are disabled.
- `isUnavailable(item) => boolean`: unavailable items can be focused but not chosen.
- `locale` (the Calendar's rule: the document's `lang`, then the browser's; `en-US` on a server
  and its hydration; followed once mounted).
- `columns` (`3`): items per row.
- `disabled`, `readOnly`.

**MonthRangeCalendar.Root** / **YearRangeCalendar.Root**: the same with `value: { start, end } |
null`.

**Heading**: default content: MonthCalendar the year (`Intl` `year: "numeric"`, "2026"),
YearCalendar the page's span (`Intl.DateTimeFormat#formatRange` of its first and last year,
"2016 – 2027").

**PrevButton**, **NextButton**: move one page (a year; 12 years); disabled when the page would
only hold items outside `min` / `max`. The consumer names them.

**GridBody**: children function `(row) => Row`, `row` the items of one row.

**Row**: `row`; children function `(item) => Cell`.

**Cell**: `value` (the month or year). Default content: MonthCalendar the month's name (`Intl`
`month: "long"`, "November": its visible text is a word of its name, WCAG 2.5.3, which the short
"Nov" is not), YearCalendar the year ("2026"). Its `aria-label` defaults to the
full name (MonthCalendar `month: "long", year: "numeric"`, "November 2026"; YearCalendar the
year), and the consumer can replace it. The locale data exception
([README](README.md#no-text-and-the-one-exception)) covers these texts as the Calendar's.

**MonthPicker.Root** (YearPicker, MonthRangePicker, YearRangePicker likewise): the DatePicker
Root's props ([calendar.md](calendar.md#api)) with a month (year, range) value: `value`,
`defaultValue`, `onValueChange`, `open`, `defaultOpen`, `onOpenChange`, `onOpenChangeComplete`,
the actions; the calendar options passed to the bound calendar (`min`, `max`, `isUnavailable`,
`locale`, `columns`); and the form props `name`, `required`, `disabled`, `readOnly`, with Field
support, all as the DatePicker's.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `data-disabled`, `data-readonly` |
| Heading | an `id`, `aria-live="polite"` |
| PrevButton, NextButton | `type="button"`, `aria-controls` (the grid's id), `disabled` and `data-disabled` when they cannot move |
| Grid | `role="grid"`, an `id`, `aria-labelledby` (the Heading), `aria-readonly="true"` when read-only, `aria-disabled="true"` when disabled, `aria-multiselectable="true"` in a range calendar |
| Cell | `role="gridcell"`, `aria-label`, `tabindex` (`0` on the focused item unless the calendar is disabled, `-1` on the others), `aria-selected="true"` when selected, `aria-disabled="true"` when disabled or unavailable, `aria-current="date"` on the item holding today; `data-today`, `data-selected`, `data-disabled`, `data-unavailable`; in a range calendar also `data-range-start`, `data-range-end`, `data-in-range`, `data-range-preview` |
| Pickers | the DatePicker's ([calendar.md](calendar.md#state-attributes-and-aria)) |

An item is **disabled** when it is entirely outside `min` / `max` or the calendar is disabled: it
cannot be focused nor chosen. **Unavailable** items can be focused, not chosen. Every cell of a
page belongs to it: there are no outside cells.

## Keyboard

In the grid ("next" is ArrowRight in LTR, ArrowLeft in RTL), the Calendar's keys mapped to the
grid of items (the APG grid pattern):

| key | moves the focused item to |
| --- | --- |
| next / previous | +1 / −1 item |
| ArrowDown / ArrowUp | +`columns` / −`columns` items (the item below / above) |
| Home / End | the first / last item of its row |
| PageDown / PageUp | +12 / −12 items: the same month of the next / previous year (MonthCalendar), the same place on the next / previous page (YearCalendar) |
| Enter, Space | chooses the focused item (unless disabled, unavailable or read-only) |
| Escape | in a range calendar with a started range, cancels it first (as RangeCalendar's, before an enclosing layer); otherwise, in a picker, closes the popup |

Moving the focused item off the page shows its page; the focused item never moves to a disabled
item (the key does nothing). A key that moves the focus renders before the next key (AGENTS.md
"Porting", 8); a cell that mounts after the keyboard moved to it takes the pending focus (5).

## Focus

- The grid is one tab stop: the focused item's cell. The **focused item** starts at the value
  (a range's start), else the item holding today, clamped into `[min, max]`.
- PrevButton and NextButton keep the focus; the focused item moves by the same page (clamped).
- After a choice the focus stays on the chosen cell.
- **Pickers**: as the DatePicker's ([calendar.md](calendar.md#focus)): opening focuses the focused
  item's cell, a choice (a range's end) closes and focuses the Trigger, Escape closes, Tab out
  closes, the popup is not modal, a reopened picker starts again from its value; the calendar
  takes the focus once the popup is a layer, so a picker inside a Dialog keeps it
  (`/date-picker/in-dialog`).

## Pointer

A press on an enabled, available item chooses it (and focuses it). In a range calendar the first
choice starts the range (hovering or focusing an item previews it, `data-range-preview`), the
second ends it, swapped when it comes first; `onValueChange` fires once, with the whole range.

## Forms

The pickers' form is the DatePicker's ([calendar.md](calendar.md#forms)), with the item's ISO
text: MonthPicker `name=2026-11`, MonthRangePicker the interval `name=2026-03/2026-06`,
YearPicker `name=2026`, YearRangePicker `name=2020/2024` (a year as ISO 8601 writes it, 4
digits); empty with no value. `required`, `disabled`, `readOnly`, a form reset and a Field work as
the DatePicker's. The inline calendars have no form, as the Calendar.

## Views (CalendarView)

A Calendar, RangeCalendar or MultipleCalendar can **switch its grid between days, months and
years** (Zag/Ark's views; React Aria and the APG have none). The view state is its own component
in its own entry, `/calendar-view`, placed inside the calendar's Root:

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | none | | the view; inside a calendar root |
| Trigger | `button` | `<calendar root>-view-trigger` (`calendar-view-trigger`, `range-calendar-view-trigger`) | goes one view up |

**Why not on the picker Root** (Issue #78's recommendation): a `view` on `DatePicker.Root` would
grow `/date-picker` and `/date-range-picker` for every picker, used or not (D8); a view of the
**calendar** serves the pickers through their bound calendar (and the typed pickers with them)
and an inline calendar alike, and leaves every existing entry unchanged.

**API.** `CalendarView.Root`: `view`, `defaultView` (`"day"`), `onViewChange(view, details)`
(`"day" | "month" | "year"`; reason `trigger-press` from the Trigger, `item-press` from a choice
in a view). Its children see the view (React: a children function `(state) => ReactNode`, or
nodes; Vue: the default slot's `{ view }`; Angular: `exportAs: "calendarView"`, `view()`), and the
consumer renders each view's header and grid: the day view the Calendar's parts, the month view a
`MonthCalendar.Root`, the year view a `YearCalendar.Root`, each **without a value**, which binds it
to the view. `CalendarView.Trigger`: a button whose content is the consumer's (typically the
view's Heading, rendered as a `span` inside it, so the button is named by the month or year it
shows); `data-view` names the current view; in the year view it is `disabled` (`data-disabled`).

**Behaviour.**

- **The Trigger goes up**: day → month → year (reason `trigger-press`).
- **A choice goes down**: choosing a year in the year view moves the calendar's focused date to
  that year (the same month and day, clamped to the month and to `min` / `max`) and shows the
  month view; choosing a month shows the day view on that month (the same day, clamped). A view's
  choice **only navigates**: the calendar's value is unchanged (a date is chosen in the day grid,
  the APG's rule), so a typed picker's segments are unchanged too.
- A bound month (year) view shows the year (the page) of the calendar's focused date, focused on
  its month (year). A month (year) is **disabled** when every one of its days is disabled (outside
  the calendar's `min` / `max`, or the calendar disabled), and **selected** when the calendar's
  value holds one of its days (a range: every month it crosses). Its own keys, paging and pointer
  are the MonthCalendar's (YearCalendar's).
- **Focus on each switch** (specified first, the Epic's risk): after the Trigger is pressed, or an
  item chosen, the **new view's focused cell takes the focus** (the pressed element may not exist
  in the new view; Zag's `focusActiveCell` after a view change): the Trigger → the month (year)
  grid's focused item; a year → the month grid's focused month; a month → the day grid's focused
  date. A view shown on its own (the first render, a picker opening on its `defaultView`) follows
  the calendar's rule: inline it takes no focus, in a picker its focused cell takes it as the
  popup opens.
- **In a picker**, Escape closes the popup in every view (the picker's layer, as the day grid's);
  reopening shows the `defaultView` again (an uncontrolled view) and the picker's value, as a new
  calendar would.
- Presets ([calendar.md](calendar.md#presets-calendarpreset)) set the value in any view.

## Animation, dismissal, positioning, RTL

Pickers: as the DatePicker's (calendar.md). Calendars: no animation. RTL: the grid flows right to
left and next / previous swap ArrowRight and ArrowLeft, from a DirectionProvider, else the grid's
computed direction, as the Calendar's.

## Scenarios

The suite fixes today at **2026-11-20**.

### `/month-calendar/basic`

A MonthCalendar, en-US, `min` 2025-03, `max` 2027-10, August 2026 unavailable (`isUnavailable`),
with PrevButton **"Previous year"**, a Heading, NextButton **"Next year"** and the Grid. Output:
`value: <ISO or none>`.

Checks:

1. A `grid` named "2026" with 4 rows of 3 cells; the first cell is named "January 2026" and reads
   "January" (strings computed with `Intl`).
2. "November 2026" has `aria-current="date"` and `tabindex="0"`; every other cell `tabindex="-1"`.
3. Tab focuses November 2026. ArrowRight → December 2026; ArrowRight → January 2027 (the grid is
   named "2027"); ArrowLeft → December 2026 ("2026"); ArrowUp → September; ArrowDown → December;
   Home → October; End → December; PageUp → December 2025 ("2025"); PageDown → December 2026.
4. Enter: `value: 2026-12`; the cell has `aria-selected="true"`.
5. ArrowUp (September), ArrowLeft (August): August 2026 has `aria-disabled="true"` and the focus;
   Enter changes nothing.
6. "Previous year": the grid is named "2025"; January and February 2025 are disabled (before
   `min`); "Previous year" is disabled.
7. "Next year" twice: "2027"; November and December 2027 are disabled; "Next year" is disabled.
8. Click June 2027: `value: 2027-06`.
9. Axe finds no violation.
10. Contract layer: every part carries `month-calendar-<part>`; 4 rows and 12 cells; no `"false"`
    state attribute.

### `/month-calendar/range`

A MonthRangeCalendar, en-US, with the same header. Output: `value: <start>..<end> or none`.

Checks:

1. The grid has `aria-multiselectable="true"`.
2. Click March 2026, hover June: March to June carry `data-range-preview` (contract layer).
3. Click June: `value: 2026-03..2026-06`; March to June have `aria-selected="true"`; March has
   `data-range-start`, June `data-range-end` (contract layer).
4. Click September, then February: `value: 2026-02..2026-09` (swapped).
5. Keyboard: the focus is on February; ArrowRight, Enter, ArrowDown, Enter: `value:
   2026-03..2026-06`.
6. Enter on June, Escape: the started range is cancelled, the value unchanged.
7. Contract layer: every part carries `month-range-calendar-<part>`.

### `/year-calendar/basic`

A YearCalendar, en-US, `min` 2010, `max` 2035, with PrevButton **"Previous years"**, a Heading,
NextButton **"Next years"**. Output: `value: ...`.

Checks:

1. A `grid` named by the page "2016 – 2027" (`Intl` `formatRange`, its spaces written as U+0020,
   as the date fields' literals), 12 cells from 2016 to 2027;
   2026 has `aria-current="date"` and `tabindex="0"`.
2. Tab focuses 2026. ArrowDown → 2029 (the grid named "2028 – 2039"); ArrowUp → 2026
   ("2016 – 2027"); Home → 2025; End → 2027; PageUp → 2015 ("2004 – 2015"); PageDown → 2027;
   PageDown again does nothing (2039 is after `max`).
3. Enter: `value: 2027`.
4. "Previous years": the page 2004 – 2015, 2004 to 2009 disabled; "Previous years" disabled.
   Click 2012: `value: 2012`.
5. Axe finds no violation.
6. Contract layer: every part carries `year-calendar-<part>`; 12 cells.

### `/year-calendar/range`

A YearRangeCalendar, en-US, with the same header. Output: `value: ...`.

Checks: click 2024, then 2020: `value: 2020..2024` (swapped); 2020 to 2024 have
`aria-selected="true"`; the grid has `aria-multiselectable="true"`. Contract layer: the parts
carry `year-range-calendar-<part>`, 2020 `data-range-start`, 2024 `data-range-end`.

### `/month-picker/form`

A native `<form>` with a MonthPicker `name="expiry"`, `required`, `min` 2026-11 (Trigger
**"Expiry: "** and the value, or "none"; Popup `aria-label` **"Choose month"** holding a bound
MonthCalendar with **"Previous year"** / **"Next year"**), a MonthRangePicker `name="period"`
(Trigger **"Period: "** and the range; Popup **"Choose months"**, a bound MonthRangeCalendar), and
**"Submit"** and **"Reset"** buttons. Output: `form: ...`.

Checks:

1. "Submit" submits nothing (`form: none`) and focuses "Expiry" (required).
2. Click "Expiry": a `dialog` named "Choose month" with a grid named "2026"; the focus is on
   November 2026; October 2026 is disabled.
3. ArrowRight, Enter: the popup closes, the focus is on the trigger, which reads "Expiry:
   2026-12".
4. Click "Period", click March 2026: the popup stays open; click June: it closes, the trigger
   reads "Period: 2026-03..2026-06".
5. "Submit": `form: expiry=2026-12&period=2026-03/2026-06`.
6. Reopen "Expiry": the focus is on December 2026 (the value); Escape closes, the focus is on the
   trigger.
7. "Reset": both triggers read "none".
8. Axe finds no violation while open.
9. Contract layer: the triggers carry `month-picker-trigger` / `month-range-picker-trigger`
   (`aria-haspopup="dialog"`), the hidden inputs `month-picker-input` / `month-range-picker-input`;
   the calendars' parts `month-calendar-*` / `month-range-calendar-*`.

### `/year-picker/form`

A native `<form>` with a YearPicker `name="year"` (Trigger **"Year: "**; Popup **"Choose
year"**, a bound YearCalendar with **"Previous years"** / **"Next years"**), a YearRangePicker
`name="years"` (Trigger **"Years: "**; Popup **"Choose years"**), and **"Submit"**. Output:
`form: ...`.

Checks:

1. Click "Year": the focus is on 2026; ArrowRight, Enter: the trigger reads "Year: 2027".
2. Click "Years", click 2024, then 2020: the trigger reads "Years: 2020..2024".
3. "Submit": `form: year=2027&years=2020/2024`.
4. Contract layer: `year-picker-*` and `year-range-picker-*` parts, `year-calendar-*` and
   `year-range-calendar-*` calendar parts.

### `/calendar-view/picker`

A DatePicker, en-US, `min` 2025-06-15, `max` 2028-02-10 (Trigger **"Choose date: "** and the
value, or "none"; Popup **"Choose date"**) holding a bound Calendar with a CalendarView: the day
view has PrevButton **"Previous month"**, a view Trigger holding the Heading, NextButton **"Next
month"**, the Grid, and a preset **"Today"**; the month view a MonthCalendar (**"Previous
year"**, a view Trigger holding its Heading, **"Next year"**, its Grid); the year view a
YearCalendar (**"Previous years"**, a view Trigger holding its Heading, **"Next years"**, its
Grid). Output: `value`, `reason` (the open change's).

Checks:

1. Click the trigger: the focus is on November 20, in a grid named "November 2026"; a button
   named "November 2026" (the view Trigger).
2. Press it: the month view, a grid named "2026"; the focus on November 2026.
3. ArrowLeft ×3, Enter (August 2026): the day view, a grid named "August 2026", the focus on
   August 20, 2026; `value: none`.
4. Press the view Trigger ("August 2026"), then the month view's ("2026"): the year view, a grid
   named "2016 – 2027", the focus on 2026; 2024 is disabled (every day before `min`), 2025 is not.
5. ArrowRight, Enter (2027): a grid named "2027", the focus on August 2027. Enter: a grid named
   "August 2027", the focus on August 20, 2027. Enter: `value: 2027-08-20`, the popup closes and the
   focus is on the trigger.
6. Reopen: the day view, the focus on August 20, 2027.
7. Press the view Trigger, "Next year": in "2028", March 2028 is disabled (after `max`).
8. Escape: the popup closes (`reason: escape-key`) and the focus is on the trigger; reopening
   shows the day view (a grid named "August 2027").
9. Press "Today": `value: 2026-11-20`, the popup closes.
10. Axe finds no violation in the month view.
11. Contract layer: the view Trigger carries `calendar-view-trigger` and `data-view`; the month
    view's parts `month-calendar-*` inside the popup; the year view's Trigger is `disabled` with
    `data-disabled`.

### `/calendar-view/typed`

A `Field.Root` **"Arrival"** around a DatePickerInput (en-US, `min` 2025-01-01, so the years
typed on the way set no value): Segments, a Trigger **"Choose
date"**, the Popup **"Choose date"** holding a bound Calendar with the same CalendarView (no
preset). Output: `value`, `changes`.

Checks:

1. Type 11/24/2026: `value: 2026-11-24`, `changes: 1`.
2. Open the popup, press the view Trigger: the month grid "2026"; November 2026 has
   `aria-selected="true"` (it holds the value) and the focus.
3. ArrowUp ×3 (February), ArrowLeft (January), Enter: the day grid "January 2026", the focus on
   January 24, 2026; `value: 2026-11-24`, `changes: 1` (navigation only); the month segment still
   shows 11.
4. Enter: `value: 2026-01-24`, `changes: 2`; the month segment shows 1 and the day 24.

## Differences from Base UI

Base UI has none of these components; the APG none of the grids or views. The decided points:

| point | decision | reason |
| --- | --- | --- |
| The month and year grids | the APG grid pattern with the Calendar's keys mapped to items (Home / End the row, Page keys one page) | the APG-closest option; the same model as the day grid |
| A year page | 12 years starting at a multiple of 12 (2016 – 2027) | pages that never shift as you move; Zag uses a decade |
| The values | `PlainYearMonth` and `PlainYear` objects | the form submits `2026-11` / `2026`, not a day; a year can carry a calendar system later |
| The views | a calendar's `CalendarView` (own entry), not a picker Root's `view` | D8: the pickers' rows unchanged; inline calendars get views too |
| Focus on a view switch | the new view's focused cell | the pressed trigger or cell may not exist in the new view (Zag focuses the active cell too) |
| A view's choice | navigates only | the value is a date, chosen in the day grid |
