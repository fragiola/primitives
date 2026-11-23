# Calendar, RangeCalendar, DatePicker, DateRangePicker

## Purpose

- **Calendar**: a month grid for choosing one date (the APG grid pattern, as the APG date picker
  dialog example's calendar uses it).
- **RangeCalendar**: the same grid for choosing a start and an end date.
- **DatePicker** / **DateRangePicker**: a trigger and a non-modal popup holding a Calendar /
  RangeCalendar.

Out of scope (stage 3, `docs/handoff.md` §5): the segmented date and time fields are
[date-field.md](date-field.md) (Epic #73); the range fields, a multiple-date calendar, month and year pickers, presets, time zones,
non-Gregorian calendars, event calendars.

## Dates

A date is a plain value `{ year, month, day }` (`month` 1–12) with no time and no time zone
(`PlainDate`, from `@fragiola/primitives/date`; no external date library). A range is
`{ start, end }` with `start <= end` (`DateRange`). Fixtures print dates as ISO strings
(`2026-11-20`, `2026-11-10..2026-11-15`). "Today" is the local date of `new Date()`.

## Anatomy

Calendar and RangeCalendar share their parts; each part's attribute names the root it sits in:
`calendar-<part>` inside a `Calendar.Root`, `range-calendar-<part>` inside a
`RangeCalendar.Root` (spec/README.md, "Part attribute").

| part | element | `data-primitives-part` (Calendar / RangeCalendar) | notes |
| --- | --- | --- | --- |
| Root | `div` | `calendar-root` / `range-calendar-root` | holds the state |
| Heading | `h2` | `calendar-heading` / `range-calendar-heading` | the month shown by the grid of the same `offset` |
| PrevButton | `button` | `calendar-prev-button` / `range-calendar-prev-button` | shows the previous page of months |
| NextButton | `button` | `calendar-next-button` / `range-calendar-next-button` | shows the next page of months |
| Grid | `table` | `calendar-grid` / `range-calendar-grid` | one month |
| GridHeader | `thead` (with one `tr`) | `calendar-grid-header` / `range-calendar-grid-header` | children function per weekday |
| HeaderCell | `th` | `calendar-header-cell` / `range-calendar-header-cell` | one weekday |
| GridBody | `tbody` | `calendar-grid-body` / `range-calendar-grid-body` | children function per week |
| Row | `tr` | `calendar-row` / `range-calendar-row` | one week; children function per date |
| Cell | `td` | `calendar-cell` / `range-calendar-cell` | one date |

DatePicker and DateRangePicker share their parts the same way:

| part | element | `data-primitives-part` (DatePicker / DateRangePicker) | notes |
| --- | --- | --- | --- |
| Root | none | | holds the value and the open state |
| Trigger | `button` | `date-picker-trigger` / `date-range-picker-trigger` | opens the popup; its content is the consumer's (for example the formatted value) |
| Portal | none | | |
| Positioner | `div` | `date-picker-positioner` / `date-range-picker-positioner` | as [popover.md](popover.md#positioning) |
| Popup | `div` | `date-picker-popup` / `date-range-picker-popup` | a non-modal `dialog` holding a `Calendar.Root` / `RangeCalendar.Root` |
| (hidden input) | `input` | `date-picker-input` / `date-range-picker-input` | rendered by the Root after its children, while it has a `name` (or a Field's); what the form submits ([Forms](#forms)) |

A `Calendar.Root` (or `RangeCalendar.Root`) rendered inside a picker's Popup without `value` /
`defaultValue` binds to the picker: it shows the picker's value and choosing a date sets it.

Each component has its own entry in every framework package (`/calendar`, `/range-calendar`,
`/date-picker`, `/date-range-picker`, D8): RangeCalendar's entry exports its Root with the shared
parts, DateRangePicker's likewise. The date math and the locale data are the toolkit's
`@fragiola/primitives/date`, which only these four entries import.

## API

**Calendar.Root**:

- `value`, `defaultValue` (`null`), `onValueChange(date, details)` (reason `item-press`).
- `min`, `max` (`PlainDate`): dates outside are disabled.
- `isDateUnavailable(date) => boolean`: unavailable dates can be focused but not chosen.
- `locale` (BCP 47; defaults to the document's `lang`, then the browser's). Server rendering
  (Epic #22): a server knows neither the browser's language nor, in React and Vue, the document,
  so without `locale` a server render, and the browser's hydration of it, use `en-US`; the
  calendar then takes the document's `lang` (else the browser's language) once it is mounted
  (React: at once in a page the browser renders alone); Angular reads its document's `lang` on the server too, and falls back to `en-US` there,
  never to the server's own language. Pass `locale` for a server render in the reader's language.
  Once mounted, a calendar with no `locale` **follows** the document's `lang`: a change of
  `<html lang>` after mount re-renders it in the new language, in every framework (Epic #49; Vue
  read it once, at mount). The toolkit's `watchDocumentLanguage` reports the change.
- "Today" is read when the calendar renders, on the server and in the browser alike: they agree
  unless their dates differ (a server in another time zone near midnight), which a hydration then
  repairs. A page rendered on a server for readers elsewhere passes a `value` or `defaultValue`
  when the first month matters.
- `firstDayOfWeek` (`0`–`6`, Sunday = 0; defaults to the locale's, from `Intl.Locale` week info
  with a fallback table).
- `visibleMonths` (`1`): how many months are shown side by side; each is a Grid with an `offset`.
- `disabled`, `readOnly`.

**RangeCalendar.Root**: the same, with `value: { start, end } | null`.

**Heading**: `offset` (`0`): which visible month it names. Its default content is the month and
year formatted by `Intl.DateTimeFormat(locale, { month: "long", year: "numeric" })`.

**PrevButton**, **NextButton**: move the visible months by `visibleMonths` (one page). Disabled
when the page would only hold dates outside `min` / `max`.

**Grid**: `offset` (`0`).

**GridHeader**: children function `(weekday) => HeaderCell`, where `weekday` is
`{ index, short, long }` (`short`: `Intl` `weekday: "short"`, `long`: `weekday: "long"`), in the
locale's order.

**HeaderCell**: `weekday`. Default content: `weekday.short`.

**GridBody**: children function `(week) => Row`, `week` being an array of 7 `PlainDate`s (6 weeks
are always rendered, so the grid never changes height).

**Row**: `week`; children function `(date) => Cell`.

**Cell**: `date`. Default content: the day number (`Intl` `day: "numeric"`). Its `aria-label`
defaults to the full date (`Intl` `dateStyle: "full"`), and the consumer can replace it.

**DatePicker.Root**: `value`, `defaultValue`, `onValueChange`, `open`, `defaultOpen`,
`onOpenChange` (an `OpenChangeDetails`, [README](README.md#open-change-details); `trigger` is
the Trigger), `onOpenChangeComplete(open)`, the actions (`close()`, `unmount()`; React
`actionsRef`), plus the calendar options (`min`, `max`, `isDateUnavailable`, `locale`,
`firstDayOfWeek`, `visibleMonths`) passed to the bound calendar; and the form props
([Forms](#forms)): `name`, `required`, `disabled`, `readOnly`. **DateRangePicker.Root**: the same
with a range.

**Picker Portal**: `container`, `keepMounted` (`false`: the popup and its calendar stay rendered,
hidden, while closed; [README](README.md#lifecycle)).

**Positioner**: as Popover's; defaults `side="bottom" align="start"`.

**Locale data is the one exception to "no text"** ([README](README.md#no-text-and-the-one-exception)):
the heading, the weekday names, the day numbers and the cells' full date names come from `Intl`.
The consumer replaces each one with its own children or `aria-label`. The prev and next buttons
have no name of their own: the consumer labels them; the picker's popup likewise (`aria-label`).

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `data-disabled`, `data-readonly` |
| Heading | an `id`, `aria-live="polite"` (only on the `offset` 0 heading) |
| PrevButton, NextButton | `type="button"`, `aria-controls` (the grids' ids), `disabled` and `data-disabled` when they cannot move |
| Grid | `role="grid"`, an `id`, `aria-labelledby` (the Heading with the same `offset`), `aria-readonly="true"` when read-only, `aria-disabled="true"` when disabled, `aria-multiselectable="true"` in a RangeCalendar |
| HeaderCell | `scope="col"`, `abbr` (the long weekday name) |
| Cell | `role="gridcell"`, `aria-label`, `tabindex` (`0` on the focused date unless the calendar is disabled, `-1` on the other dates of the shown months, absent on outside-month cells), `aria-selected="true"` when selected (absent otherwise), `aria-disabled="true"` when disabled, unavailable or outside the month, `aria-current="date"` on today; `data-today`, `data-selected`, `data-disabled`, `data-unavailable`, `data-outside-month`; in a RangeCalendar also `data-range-start`, `data-range-end`, `data-in-range`, `data-range-preview` |
| Picker Trigger | `type="button"`, `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` (the popup's id, while open), `data-popup-open` while open (Base UI's name, D4 §3 "Naming"); `disabled` and `data-disabled` while the picker is disabled, `data-readonly` while read-only, `data-required` while required; inside a Field, its ids, `aria-*` and state attributes ([field.md](field.md#integration-contract)) |
| Picker hidden input | `name`, `value` (ISO), `required`, `disabled`, `aria-hidden="true"`, `tabindex="-1"`, structural inline style (visually hidden) |
| Picker Positioner | `role="presentation"`, `data-open` / `data-closed`, `data-side`, `data-align`; `hidden` while kept mounted and closed |
| Picker Popup | `role="dialog"` (no `aria-modal`), an `id`, `data-open` / `data-closed`, `data-side`, `data-align`, `data-starting-style`, `data-ending-style` |

A date is **disabled** when it is before `min`, after `max`, or the calendar is disabled: it
cannot be focused (by the keyboard, nor by a press) nor chosen. A date is **unavailable** when
`isDateUnavailable` says so: it can be focused but not chosen. **Outside-month** cells (the
leading and trailing days of the 6-week grid) cannot be focused nor chosen; the keyboard reaches
those dates by moving the visible month.

## Forms

The pickers work in a native `<form>` (Stage 0 left them out; production scope §3.6, "essential"),
as the other form controls do (spec/README.md, "Forms"):

- **`name`**: the Root renders a hidden input after its children, which the form submits. A
  DatePicker submits `name=<ISO date>` (`2026-11-24`), or an empty value with no date. A
  DateRangePicker submits **one** entry, the ISO 8601 interval `name=<start>/<end>`
  (`2026-11-25/2026-11-27`), or an empty value until both ends are chosen. Inside a
  [Field](field.md), the field's `name` wins.
- **`required`**: the hidden input is `required`, so a native form's validation blocks a
  submission with no value (`valueMissing`), and focus moves to the Trigger (the form bridge,
  spec/README.md). The hidden input is a visually hidden text input (`type="text"`,
  `aria-hidden="true"`, `tabindex="-1"`), not `type="hidden"`, which the browser never validates.
- **`disabled`**: the Trigger is disabled (it cannot open the popup) and the hidden input too (it
  submits nothing). A Field's or a Fieldset's `disabled` disables it as well.
- **`readOnly`**: the value cannot change: the Trigger still opens the popup, whose calendar is
  read-only (it can be browsed, no date can be chosen); the hidden input still submits.
- **A form reset** returns an uncontrolled picker to its `defaultValue` (a controlled one reports
  it through `onValueChange`, reason `none`), as the other controls.
- **Field**: the Trigger is the labelable element and the focus target; the value given to
  `validate` is the date or the range (or `null`); the hidden input is the validated element
  ([field.md](field.md#integration-contract)).

## Keyboard

In the grid (the APG date picker dialog example's grid). "Next day" is ArrowRight in LTR and
ArrowLeft in RTL:

| key | moves the focused date to |
| --- | --- |
| next day / previous day | +1 / −1 day |
| ArrowDown / ArrowUp | +7 / −7 days |
| Home / End | the first / last day of its week (by the locale's first day) |
| PageDown / PageUp | the same day of the next / previous month (clamped to the month's last day) |
| Shift+PageDown / Shift+PageUp | the same day of the next / previous year (clamped) |
| Enter, Space | chooses the focused date (unless disabled, unavailable or read-only) |
| Escape | in a RangeCalendar with a started range, cancels it first, also inside a picker, a dialog or a popover (it takes the key before the enclosing layer, `@fragiola/primitives/layers` `interceptEscape`; Epic #22); otherwise, in a picker, closes the popup |

- Moving the focused date outside the visible months moves them (by one month, so the focused
  date's month becomes the first or last visible month).
- The focused date never moves to a disabled date (before `min` / after `max`): the key does
  nothing.
- Each move updates the Heading (announced through its `aria-live`).
- **A key that moves focus renders before the next key** (AGENTS.md, "Porting", 8): moving the
  focused date into another month shows that month and focuses its cell within the event, so a
  quick second key reaches the new cell. A cell that mounts after the keyboard moved to it (a new
  month, a picker opening) takes the pending focus itself (5).

## Focus

- The grid is one tab stop: the focused date's cell. The **focused date** starts at the value
  (the range's start), else today, clamped into `[min, max]`.
- PrevButton and NextButton keep focus on themselves; the focused date moves by the same number
  of months (clamped).
- After a choice, focus stays on the chosen cell (Calendar, RangeCalendar).
- **Pickers**: opening focuses the focused date's cell. Choosing a date (DatePicker) or a range's
  end (DateRangePicker) closes the popup (reason `item-press`) and focuses the Trigger. Escape
  closes (reason `escape-key`) and focuses the Trigger. Focus is not trapped: as in
  [popover.md](popover.md#focus), the popup's content comes right after the Trigger in the tab
  order. Tab from its last tabbable element closes (reason `focus-out`) and moves focus to the
  element after the Trigger; Shift+Tab from its first closes (reason `focus-out`) and focuses the
  Trigger.
- **A picker closed through the controlled `open`** (reason `none`): focus left inside the popup
  returns to the Trigger, as Popover's (Epic #22).
- **Reopening**: a picker opens on its value as a new calendar would, even when it reopens while
  its popup's exit animation still runs (the calendar is still mounted): the focused date returns
  to the value (else today), and closing cancels a started range.
- **After an outside press** (as [popover.md](popover.md#focus), D4 §3 "Popover focus after an
  outside press"): focus returns to the Trigger unless the press landed on a focusable element,
  which keeps the focus the press gave it (`returnFocus.whenUnfocused`). The POC's pickers moved no
  focus.

## Pointer

- Clicking an enabled, available date chooses it (and focuses it).
- **RangeCalendar**: the first choice sets the start (the range is pending); while pending,
  hovering or focusing a date previews the range between the start and it
  (`data-range-preview`; a key that moves the focused date previews to it again); the second
  choice sets the end. If the second date is before the
  first, they are swapped. `onValueChange` fires once, with the complete range.
- Pickers: a press on the Trigger toggles (reason `trigger-press`).

## Dismissal and layering

Calendars: none. Pickers: as [popover.md](popover.md#dismissal-and-layering) (a layer; Escape,
outside press, focus out), with focus returning to the Trigger on Escape. No scroll lock, no inert
page.

## Positioning

Pickers: as Popover's, defaults `side="bottom" align="start"`.

## Animation

Pickers' Popup as [popover.md](popover.md#animation); `keepMounted`, `onOpenChangeComplete` and the
actions as [README](README.md#lifecycle): a kept-mounted picker's calendar stays mounted and takes
the focus again when it reopens, as a picker reopened during its exit does. Calendars: none.

## RTL

The grid flows right to left (from the document's `dir`); next/previous day swap ArrowRight and
ArrowLeft. The keys follow a [DirectionProvider](direction.md)'s direction, else the grid's
computed one. Week order still starts at the locale's first day, on the inline-start side.

## Scenarios

The suite fixes today at **2026-11-20** (Friday). November 2026 starts on a Sunday and has 30
days.

### `/calendar/single`

`locale="en-US"`. Content: a PrevButton with `aria-label` **"Previous month"**, a Heading, a
NextButton **"Next month"**, one Grid. Output: `value: <ISO or none>`.

Checks:

1. A `grid` named "November 2026" (by its heading); 7 `columnheader`s, the first with text "Sun".
2. The `gridcell` named "Friday, November 20, 2026" has `aria-current="date"` and `tabindex="0"`;
   every other in-month cell has `tabindex="-1"`.
3. Tab into the grid focuses November 20. ArrowRight → November 21; ArrowDown → November 28;
   ArrowDown → December 5 and the grid is named "December 2026"; ArrowUp → November 28 ("November
   2026"); Home → November 22 (Sunday); End → November 28 (Saturday).
4. PageDown → December 28; PageUp → November 28; Shift+PageDown → November 28, 2027 ("November
   2027"); Shift+PageUp → November 28, 2026.
5. Enter chooses it: output `value: 2026-11-28`, the cell has `aria-selected="true"`.
6. Click "Next month": the grid is named "December 2026" and focus stays on the button.
7. In December's grid, the trailing cells (January 2027) are outside the month:
   `aria-disabled="true"`, no `tabindex`; clicking one does nothing.
8. Click December 3: `value: 2026-12-03`.
9. Two quick keys across a month (ArrowDown twice from November 27, without waiting): focus ends
   on December 11 (rule 8 of "Keyboard").
10. Axe finds no violation.
11. Contract layer: the parts, 6 rows and 42 cells, 12 outside-month cells with no `tabindex`, no
    `"false"` state attribute.

### `/calendar/min-max`

`min = 2026-11-10`, `max = 2026-12-05`, en-US.

Checks:

1. November 9 has `aria-disabled="true"`; clicking it does not choose it.
2. "Previous month" is disabled; "Next month" is enabled.
3. Focus November 10 (click it), ArrowLeft: focus stays on November 10.
4. Click "Next month": in December, "Next month" is disabled and December 6 is disabled.

### `/calendar/unavailable`

Weekends are unavailable (`isDateUnavailable`), en-US.

Checks: November 21 (Saturday) has `aria-disabled="true"`; the keyboard can focus it
(ArrowRight from November 20); Enter does not choose it (output unchanged).

### `/calendar/locale?locale=de-DE`

The single scenario with `locale="de-DE"`.

Checks (expected strings computed in the test with `Intl` for `de-DE`):

1. The grid is named "November 2026".
2. The first `columnheader` is Monday's short name ("Mo").
3. The first row starts with October 26 (outside the month).
4. Focus November 20, Home → November 16 (Monday).
5. The cell names are German full dates ("Freitag, 20. November 2026").

### `/calendar/single?locale=none`

The single scenario with no `locale` and no `<html lang>` (the browser's language is
`de-DE` in the check; the server's, in the ssr layer, German too).

Checks: once mounted, the calendar speaks the browser's language (Monday's short name first); its
server render and hydration (the ssr layer) match the browser's own render. Setting
`<html lang="fr-FR">` after mount re-renders it in French (the heading "novembre 2026", Monday's
short name first), with no other event (Epic #49).

### `/calendar/rtl?locale=he-IL&dir=rtl`

The single scenario in Hebrew, right to left.

Checks: focus November 20; ArrowLeft → November 21; ArrowRight → November 20 → November 19.

### `/calendar/two-months`

`visibleMonths = 2`, en-US. Two Headings and Grids (`offset` 0 and 1).

Checks:

1. Two grids named "November 2026" and "December 2026".
2. Focus November 30, ArrowRight → December 1 (in the second grid); the visible months do not
   change.
3. "Next month" shows "January 2027" and "February 2027".

### `/calendar/range`

RangeCalendar, en-US. Output: `value: <start>..<end>` or `none`.

Checks:

1. Click November 10, hover November 15: November 10–15 carry `data-range-preview` (contract
   layer).
2. Click November 15: `value: 2026-11-10..2026-11-15`; November 10–15 have
   `aria-selected="true"`; November 10 has `data-range-start`, November 15 `data-range-end`
   (contract layer).
3. Click November 18, then November 12: `value: 2026-11-12..2026-11-18` (swapped).
4. Keyboard: focus November 20, Enter, ArrowRight twice, Enter: `value: 2026-11-20..2026-11-22`.
5. Enter on November 24, Escape: the pending range is cancelled; the value is unchanged.
6. The grid has `aria-multiselectable="true"`.
7. Contract layer: every part carries `range-calendar-<part>`, none `calendar-<part>`.

### `/date-picker/basic`

DatePicker, en-US. The Trigger's text is **"Choose date: "** followed by the value (or "none"),
which is also its accessible name (no `aria-label`: WCAG 2.5.3 wants the visible text in the
name); the Popup (`aria-label` **"Choose date"**) holds a bound Calendar with PrevButton
**"Previous month"** and NextButton **"Next month"**. Output: `value: ...`, `open: ...`,
`reason: ...`.

Checks:

1. Trigger has `aria-haspopup="dialog"`, `aria-expanded="false"`.
2. Click it: a `dialog` named "Choose date", with a grid named "November 2026"; focus on
   November 20.
3. ArrowRight ×4, Enter: `value: 2026-11-24`, the popup closes (`reason: item-press`), focus on
   the trigger.
4. Reopen: focus on November 24 (the value). Choosing a date with the pointer and reopening at
   once (while the popup's exit animation may still run) focuses the chosen date too.
5. Escape closes (`reason: escape-key`), focus on the trigger.
6. Reopen, click the output (not focusable): closes (`reason: outside-press`) and focus returns
   to the trigger.
7. Reopen (focus on the date cell, the popup's last tabbable element), Tab: closes
   (`reason: focus-out`). Reopen, Shift+Tab ×3 (Next month, Previous month, then out): closes
   (`reason: focus-out`), focus on the trigger.
8. Axe finds no violation while open.
9. Contract layer: the Trigger has `data-popup-open` while open (and no `data-open`); the Popup
   has `data-open`; the Positioner `data-side="bottom"` and `data-align="start"`.

### `/date-picker/range`

DateRangePicker, en-US, Trigger text **"Choose dates: "** followed by the range (or "none"); the
Popup's `aria-label` is **"Choose dates"**.

Checks: open; click November 10: the popup stays open; click November 13: `value:
2026-11-10..2026-11-13`, the popup closes and focus is on the trigger. Contract layer: the
picker's parts carry `date-range-picker-<part>`, its calendar's `range-calendar-<part>`.

### `/date-picker/form`

A `<form>` with a DatePicker `name="arrival"`, `required` (Trigger **"Arrival: "** and the value,
or "none"; Popup `aria-label` **"Choose date"**), a DateRangePicker `name="stay"`, `required`
(Trigger **"Stay: "** and the range; Popup `aria-label` **"Choose dates"**), a DatePicker
`name="departure"`, `readOnly`, `value` 2026-11-30 (the fixture holds it; Trigger
**"Departure: "** and the value; Popup `aria-label` **"Departure date"**), a DatePicker `name="return"`, `disabled` (Trigger
**"Return: "** and the value), and **"Submit"** and **"Reset"** buttons. "Today" is 2026-11-20.
Output: `form: ...`.

Checks:

1. "Submit" submits nothing (`form: none`, required) and focuses "Arrival".
2. Choosing November 24 in "Arrival", then "Submit", still submits nothing and focuses "Stay".
3. Choosing November 25 then 27 in "Stay", then "Submit", gives
   `form: arrival=2026-11-24&stay=2026-11-25/2026-11-27&departure=2026-11-30` (the disabled picker
   submits nothing).
4. "Departure" opens its popup; a click on November 26 changes nothing (read-only): the trigger
   still reads "Departure: 2026-11-30". Its trigger carries `data-readonly`.
5. "Return" is disabled.
6. "Reset" returns "Arrival" and "Stay" to "none"; "Submit" submits nothing again.
7. Axe finds no violation.
8. Contract layer: each picker's hidden input carries `date-picker-input` /
   `date-range-picker-input`, `aria-hidden="true"` and `tabindex="-1"`; the required triggers carry
   `data-required`, the disabled one `data-disabled`.

The pickers inside a [Field](field.md) are [`/field/more-controls`](field.md#fieldmore-controls).

### `/date-picker/mixed-form`

A native `<form>` mixing a picker and native controls (Epic #49): a DatePicker `name="arrival"`,
`required` (Trigger **"Arrival: "** and the value, or "none"; Popup `aria-label` **"Choose
date"**, a bound Calendar), then a native text input `name="guest"`, `required`, labelled
**"Guest name"** (`<label>` around it), and a **"Submit"** button. "Today" is 2026-11-20. Output:
`form: ...`.

Checks:

1. "Submit" submits nothing (`form: none`) and focuses "Arrival": the browser does not move the
   focus on to "Guest name", the later invalid native control (spec/README.md, "Forms").
2. Choosing November 24 in "Arrival", then "Submit": submits nothing, and the browser focuses
   "Guest name".
3. Typing `Ada` in "Guest name", then "Submit": `form: arrival=2026-11-24&guest=Ada`.

### `/date-picker/lifecycle`

The lifecycle scenario ([README](README.md#the-lifecycle-scenarios)), en-US: a DatePicker whose
Trigger reads **"Choose date: "** and the value (or "none"); its Portal has `keepMounted` (the
Positioner is the kept-mounted part); the Popup (`aria-label` **"Choose date"**) holds a bound
Calendar with PrevButton **"Previous month"** and NextButton **"Next month"**.

Checks: the common checks (no "Close with actions"); reopened, focus is on November 20 (today).

## Differences from Base UI

Base UI has no calendar and no date picker (`docs/catalog.md`), so the behaviour comes from the
APG (the grid pattern and the date picker dialog example) and the POC's spec, measured in the POC
against React Aria Components 1.22. The decided points:

| point | decision | reason |
| --- | --- | --- |
| The weekday header row | **exposed** (`columnheader`s with `abbr`); React Aria hides it | the APG example's `th` headers |
| Today | `aria-current="date"`; React Aria prefixes "Today, " to the name | the cell's name stays the date, which no text of ours changes |
| Home / End | the start and end of the **week** (React Aria: of the month) | the APG date picker grid |
| Enter that starts a range | keeps the focused date (React Aria moved it a day) | the APG grid: Enter chooses, it does not move |
| The picker's popup | a **non-modal** popup, as a Popover: not trapped, Tab out closes (React Aria and the APG example are modal, the APG's with OK / Cancel buttons) | the POC's decision, kept: choosing a date closes the picker, so there is nothing to confirm, and the popup's content follows its trigger in the tab order (popover.md) |
| The trigger's open state | `data-popup-open` (the POC: `data-open`) | Base UI's name for every trigger (D4 §3 "Naming") |
| Focus after an outside press | returns to the trigger unless the press focused something (the POC: no focus move) | as Popover (D4 §3), since a picker's popup is one |
| The part attribute | `calendar-*` / `range-calendar-*`, `date-picker-*` / `date-range-picker-*`, by the root (the POC: `data-calendar-part` and `data-date-picker-part` for both) | spec/README.md, "Part attribute": the value names the component |
