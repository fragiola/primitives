# DateField, TimeField

## Purpose

- **DateField**: a date typed in parts (a month, a day, a year), each part a `spinbutton` the user
  types digits into or steps with the keys; with a time granularity (`hour`, `minute`, `second`),
  a date and a time typed the same way.
- **TimeField**: a time of day typed in parts (an hour, minutes, seconds, a day period).

Both are form controls: they work in a native `<form>` (they submit an ISO value, validate and
reset) and in a [Field](field.md). A date chosen on a month grid is a [Calendar](calendar.md); a
picker that opens one is a [DatePicker](calendar.md). The range fields and the picker inputs
(a DateField inside a DatePicker) are Stage 3's next Epic; calendar systems and time zones its
last one (`docs/handoff.md` §5).

**Scope: stage 3** (Epic #73; Issue #71: the toolkit's segment editing and time values, and
DateField; Issue #72: TimeField and DateField's time granularities). **The APG has no date field
and Base UI has no date component** (`docs/catalog.md`), so D4 falls back to the APG-closest
option: **each editable segment is an APG `spinbutton`** (its role, values and keys), the
segments sit in a `group` named by the field's label, and the behaviour the APG leaves open
(typing, auto-advance, placeholders, the day period) follows React Aria's `DateField` and
`TimeField` as a behaviour reference only (Zag and Ark's date input likewise; nothing copied).
Each choice is in "Differences from React Aria" and `docs/decisions.md`. The maintainer decided
(2026-11-23) that dates, times, calendar systems and time zones are written in-house on `Intl`,
with no date library.

## Values

A date is the calendars' `PlainDate` (`{ year, month, day }`, `@fragiola/primitives/date`). A
time is a **`PlainTime`**, `{ hour, minute, second, millisecond }` (`hour` 0–23), and a date with
a time a **`PlainDateTime`**: a `PlainDate` and a `PlainTime` in one flat object
(`{ year, month, day, hour, minute, second, millisecond }`), so the date math and the calendars
take it as a date. Neither has a time zone (Epic 4 adds them). Both are the toolkit's new
**`@fragiola/primitives/time`** entry (the Issue's name): immutable values with `plainTime`,
`plainDateTime`, `compareTimes`, `compareDateTimes` (a `PlainDate` counts as its midnight),
`addTime` (carrying, wrapping around midnight), `cycleTime` (one field, wrapping, carrying
nothing), `addDateTime`, the ISO text (`toIsoTime`: `14:30`, `14:30:05`, `14:30:05.120`, the
shortest exact form unless a precision is given; `toIsoDateTime`: `2026-11-23T14:30`; and their
`fromIso*` parsers) and the clock's "now" (`currentTime`, `currentDateTime`, the local time of
`new Date()`, as the calendars' `today`). `/date` is unchanged, so the four existing date entries
stay as they were.

A field's value is **set only once every segment is**: until then it is `null`, and the segments
already set wait in the field's own state. Clearing a segment of a complete value makes it `null`
again. A field writes its value at its granularity: the units below it are 0 (a `minute` field's
`second` and `millisecond`).

## Segments

The toolkit's new **`@fragiola/primitives/segments`** entry (the Issue's name) holds the segment
editing, framework-free and pure: `segmentFormat({ locale, kind, granularity, hourCycle })` reads
the field's format from `Intl.DateTimeFormat#formatToParts` (`year: "numeric"`, `month: "numeric"`,
`day: "numeric"`, `hour: "numeric"`, `minute` and `second` `"2-digit"`, `timeZone: "UTC"`, so no
host time zone ever moves a value): the order of the segments, the literals between them, the
hour cycle (`h11`, `h12`, `h23`, `h24`), the day period texts, the locale's digits and each
segment's name (`Intl.DisplayNames`, `type: "dateTimeField"`). `dateSegments(format, values)`
gives the segments to render; `typeSegment`, `eraseSegment`, `stepSegment`, `segmentToEdge` and
`segmentKeyDown` the edits; `segmentTarget` the focus moves; `segmentValuesOf` and
`segmentsToDate` / `segmentsToTime` / `segmentsToDateTime` convert a value. Only the two fields
import `/segments` and `/time`; the calendars and pickers never do, nor does the Dialog + Tabs app
of the bundle guard.

A segment is one of:

| type | shows | range (`aria-valuemin`, `aria-valuemax`) | digits |
| --- | --- | --- | --- |
| `year` | the year | 1–9999 | 4 |
| `month` | the month number | 1–12 | 2 |
| `day` | the day of the month | 1 to the days of its month (31 with no month set, 29 in February with no year) | 2 |
| `hour` | the hour in the format's cycle | `h12` 1–12, `h11` 0–11, `h23` 0–23, `h24` 1–24 | 2 |
| `minute`, `second` | two digits | 0–59 | 2 |
| `dayPeriod` | AM or PM in the locale (`Intl`'s text) | 0 (AM) – 1 (PM) | a letter |
| `literal` | the text between segments (`/`, `.`, `, `, the locale's bidirectional marks) | none | |
| `era` | an era, where a format writes one (not editable) | none | |

Each segment's **text** is its value as `Intl` writes it in the locale (the locale's digits:
Arabic-Indic in `ar-EG`), the digits being typed while a segment waits for its next one (`0` of
`05`), or, for a **placeholder** (a segment with no value), one en dash `–` per digit (`––` for a
month, `––––` for a year, `––` for a day period): a placeholder carries no language, so it is no
text of ours (spec/README.md, "No text"); the consumer replaces it through the Segment's content.

A day set past the end of a month the user then sets (31, then February) is clamped into it.

## Anatomy

DateField and TimeField share their parts; each part's attribute names the root it sits in:
`date-field-<part>` inside a `DateField.Root`, `time-field-<part>` inside a `TimeField.Root`
(spec/README.md, "Part attribute"; RangeCalendar's way with the Calendar's parts).

| part | element | `data-primitives-part` (DateField / TimeField) | notes |
| --- | --- | --- | --- |
| Root | `div` | `date-field-root` / `time-field-root` | holds the value and the segments' state; renders the hidden input after its children |
| Input | `div` | `date-field-input` / `time-field-input` | `role="group"`: the segments; children function per segment, or every segment when it has no children |
| Segment | `span` | `date-field-segment` / `time-field-segment` | one segment: a `spinbutton` when editable, hidden from assistive technology when a literal |
| (hidden input) | `input` | `date-field-hidden-input` / `time-field-hidden-input` | rendered by the Root; what the form submits and validates ([Forms](#forms)) |

Each component has its own entry in every framework package (`/date-field`, `/time-field`, D8):
TimeField's entry exports its Root with DateField's Input and Segment (`ENTRY_DEPENDENCIES`:
`date-field` on `field`, `time-field` on `date-field` and `field`). The segment editing and the
time values are the toolkit's `/segments` and `/time`, which only these two entries import.

## API

**DateField.Root**:

- `value`, `defaultValue` (`null`), `onValueChange(value, details)`: a `PlainDate` (granularity
  `day`), a `PlainDateTime` (a time granularity), or `null` while a segment is a placeholder.
  `details` is `{ reason, event }` (spec/README.md, "Change details").
- `granularity` (`"day"`): `"day"` edits a date; `"hour"`, `"minute"`, `"second"` add the time's
  segments down to that unit (Issue #72), and the value becomes a `PlainDateTime`.
- `placeholderValue`: the value a placeholder segment starts from when a key steps it (ArrowUp on
  an empty month gives the placeholder's month); default: today at midnight (read when the field
  renders, as the calendars' today). It is never shown.
- `hourCycle` (`12` or `24`; default: the locale's): a time granularity's clock. `12` takes the
  locale's 12-hour cycle (`h12`, or `h11` in `ja-JP`).
- `min`, `max` (`PlainDate`, or a `PlainDateTime` with a time granularity; a `PlainDate` bound
  counts as its midnight): a value outside is **invalid** ([Validation](#validation)). The Issue
  named them `minValue` / `maxValue` (React Aria's names); they are `min` / `max`, as the
  Calendar's and the pickers' (and a NumberField's), so a picker input (Epic 2) passes its own
  bounds through unchanged.
- `isDateUnavailable(date) => boolean`: an unavailable date is invalid, as the calendars'.
- `locale` (BCP 47; defaults to the document's `lang`, then the browser's, as
  [calendar.md](calendar.md#api) "API": a server render and its hydration use `en-US`, and a field
  with no `locale` follows a later change of `<html lang>`).
- `required`, `readOnly`, `disabled` (`false`), `name` ([Forms](#forms)).

**TimeField.Root**: the same over a `PlainTime`: `value`, `defaultValue`, `onValueChange`,
`granularity` (`"hour"`, `"minute"` (default), `"second"`), `placeholderValue` (default:
midnight), `hourCycle`, `min`, `max` (`PlainTime`; time zones come in Epic 4), `locale`,
`required`, `readOnly`, `disabled`, `name`; no `isDateUnavailable`.

**Input**: no props. Its children: a function of each segment (React `children`, Vue's default
scoped slot `v-slot="{ segment }"`, Angular `@for` over `segments()`), else every segment rendered
with its default content. Its accessible name is the Field's label (`aria-labelledby`), else the
consumer's (`aria-label`, `aria-labelledby`).

**Segment**: `segment` (required): one of the Input's segments,
`{ type, index, text, editable, placeholder, value, min, max, valueText, label }` (the toolkit's
`DateSegment`). Its default content is `segment.text`; the consumer's content replaces it (a
placeholder's own text, say). Its `aria-label` defaults to `segment.label`, the segment's name in
the locale (`Intl.DisplayNames`: "month", "Monat"); the consumer's `aria-label` replaces it.

**The locale data exception** (spec/README.md, "No text") covers the fields as it covers the
calendars: the segments' texts, their `aria-valuetext` and their names come from `Intl`, and the
consumer can replace each one.

Change reasons (spec/README.md): `input-change` (a typed digit or letter changed the value, or
completed it; an erased digit that leaves a value, a year 2026 erased to 202), `input-clear`
(Backspace or Delete made it `null`), `keyboard` (an arrow, Page Up,
Page Down, Home or End changed it), `none` (a form reset).

### Typing

A segment takes the keys itself: it is `contenteditable` (so a touch keyboard opens on it, with
`inputmode="numeric"`, `"text"` for the day period), and every edit the browser would make is
cancelled (`beforeinput`): the field writes the segment's text from its state.

- **A digit** (ASCII, the locale's, Arabic-Indic or Extended Arabic-Indic) continues the digits
  typed into the focused segment: `1` then `2` is month 12. A number that would leave the range
  starts again from the new digit (`1` then `3` in a month is month 3). The segment is set once
  the number is in range (`0` alone in a month waits, showing `0`), and **focus moves on** to the
  next editable segment (in the locale's order) once no further digit could fit: `4` in a month,
  `12`, `3` in a February day with the year set, the fourth digit of a year. A year is typed in
  full: `26` is the year 26, never expanded to 2026.
- **A letter** in the day period: the first letter of its AM or PM text in the locale (`a`, `p` in
  `en-US`; `ص`, `م` in `ar-EG`); focus moves on.
- **Backspace**, **Delete**: remove the segment's last digit (a day period is cleared at once);
  the last one makes the segment a placeholder; on a placeholder, focus moves to the previous
  segment.
- Any other character is refused. A paste and an IME composition are not supported (known limit:
  a composition cannot be cancelled; the segment's text is written back when it ends).
- An hour typed into a 12-hour cycle keeps the day period set, else the hour's own half of the
  day, else the placeholder's (AM by default); setting the day period moves a set hour into its
  half.

## State attributes and ARIA

Every part carries the field's state: `data-disabled`, `data-readonly`, `data-required`,
`data-invalid` (the value is out of range or unavailable, or the Field shows an error), and
inside a Field its `data-valid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`.

| part | attributes |
| --- | --- |
| Input | `role="group"`, `aria-labelledby` (the Field's label), `aria-describedby` (the Field's description and errors) |
| editable Segment | `role="spinbutton"`, an `id`, `tabindex="0"` (none while disabled), `aria-label` (its name), `aria-labelledby` (the Field's label, then the segment itself: "Birth date month"; inside a Field only), `aria-valuenow`, `aria-valuetext` (its text; a month's name, `Intl` `month: "long"`), `aria-valuemin`, `aria-valuemax`; a placeholder has no `aria-valuenow` and no `aria-valuetext` (APG: the spinbutton has no value yet); `aria-invalid="true"` while invalid, `aria-required="true"`, `aria-readonly="true"`, `aria-disabled="true"`; `contenteditable="true"` (not while disabled or read-only), `inputmode`, `spellcheck="false"`, `autocorrect="off"`, `autocapitalize="off"`, `enterkeyhint="next"`; `data-type` (its type), `data-placeholder` while a placeholder |
| literal Segment | `aria-hidden="true"`, `data-type="literal"` |
| hidden input | `name`, `value` (ISO), `type` ([Forms](#forms)), `min`, `max`, `step="any"`, `required`, `disabled`, `aria-hidden="true"`, `tabindex="-1"`, structural inline style (visually hidden) |

**Bidirectional text.** A numeric segment has the structural inline style
`unicode-bidi: embed; direction: ltr` (React Aria's fix): its digits are one left-to-right run
whatever surrounds them, so the segments keep the order the locale's own text has, filled or not
(`he-IL`'s `23.11.2026` reads left to right in a right-to-left page; `ar-EG`'s, whose literals
carry right-to-left marks, right to left), and a segment does not jump as it fills. It is layout,
not decoration: without it, the en dashes of placeholders (neutral characters) take the page's
direction and the segments trade places as they fill. The consumer lays the segments out inline
(the recipes' Input is an `inline-block`): as flex items, a right-to-left page would order them
right to left whatever the locale's text says.

## Keyboard

On a focused editable segment (the APG spinbutton):

| key | does |
| --- | --- |
| ArrowUp / ArrowDown | +1 / −1, wrapping within the segment (December + 1 is January; nothing carries into the year). A 12-hour cycle's hour wraps within its half of the day (11 AM + 1 is 12 AM); the day period toggles. A placeholder takes the `placeholderValue`'s value instead, with no step |
| Page Up / Page Down | the same by a larger step: year 5, month 2, day 7, hour 2, minute and second 15 (React Aria's) |
| Home / End | the segment's minimum / maximum |
| ArrowLeft / ArrowRight | the editable segment to the left / right **on screen** (where the bidirectional text placed it, measured), not in the document's order |
| digits, a day period's letter, Backspace, Delete | [Typing](#typing) |
| Tab, Shift+Tab | the next / previous segment, then out of the field: each editable segment is a tab stop (each is a spinbutton, APG) |

A read-only field's segments are focusable and move with ArrowLeft / ArrowRight; no key changes
them. A key that moves the focus (a completed segment, ArrowLeft / ArrowRight, Backspace on a
placeholder) moves it within the event, so a quick next key reaches the new segment (AGENTS.md
"Porting", 8).

## Focus

- Each editable segment is a tab stop; a disabled field has none.
- A press on a segment focuses it. A press on the Field's label focuses the first editable
  segment (a label names a `group`, which no `for` can point at: the toolkit's
  `focusOnLabelPress`).
- The digits typed into a segment are dropped when it loses the focus: typing into it again
  starts over.
- A form whose validation fails at the field focuses its first editable segment (the form bridge;
  a [Form](form.md) the same).
- Leaving the Input (focus outside it) is the field's blur; focus moving between segments is not.

## Pointer

A press focuses the segment it lands on; nothing else. A press on a disabled segment does nothing.

## Validation

The value is **invalid** when it is before `min`, after `max`, or (DateField) `isDateUnavailable`
says so: the Root carries `data-invalid` and every editable segment `aria-invalid="true"`, outside
a Field as inside one. The hidden input is a native date, date-time or time input with `min` and
`max`, so the browser's own validity reports a value out of range (`rangeUnderflow`,
`rangeOverflow`: a native form refuses it, a Field shows its error); an unavailable date has no
native validity (its message would be our text), so a native form submits it: a Field's
`validate` (which can call the same `isDateUnavailable`) blocks it with the consumer's message.

A TimeField's `min` later than its `max` is no range across midnight (HTML's reversed time range
is not followed): every value is out of range. Stepping across midnight (00 − 1 is 23) never makes
a value valid: it is compared with the bounds as any other.

## Forms

The Root renders one hidden input after its children (`*-hidden-input`, spec/README.md "Forms"):
`type="date"` for a date (`2026-11-23`), `type="datetime-local"` for a date and time
(`2026-11-23T14:30`, `2026-11-23T14:30:05` at `second`), `type="time"` for a time (`14:30`,
`14:30:05`), its value the ISO text at the field's granularity (empty while `null`), with `min`
and `max` written the same way, `step="any"` (a seconds value is no step mismatch), `required` and
`disabled`; visually hidden, `aria-hidden="true"`, `tabindex="-1"`.

- **`name`**: the hidden input's name; inside a Field, the Field's `name` wins.
- **`required`**: a native form refuses an empty field (`valueMissing`) and the first editable
  segment takes the focus.
- **`disabled`**: no segment is focusable nor editable, and nothing is submitted. A Field's or a
  Fieldset's `disabled` disables it too.
- **`readOnly`**: the segments are focusable and the value is submitted; nothing changes it.
- **A form reset** returns an uncontrolled field to its `defaultValue` (every segment a
  placeholder for `null`), reason `none`, and writes the rendered value back onto the hidden
  input.

### In a Field

DateField and TimeField are Field controls (spec/field.md, "Integration contract"): the Input is
named by the field's label and described by its description and errors; each segment is named by
the label and its own name; a press on the label focuses the first segment; `validate` receives
the value (or `null`); the focus and blur are the Input's (entering and leaving it); the
validated element is the hidden input; the focus target is the first editable segment; the
Field's state attributes are on every part.

## RTL

The segments keep the locale's order in the document (the order of `formatToParts`) and show it
as the locale's own text reads (see "Bidirectional text"): `he-IL` left to right, `ar-EG` right to
left. ArrowLeft and ArrowRight follow the screen, so they need no direction: in `he-IL`,
ArrowRight from the day goes to the month; in `ar-EG`, ArrowLeft does.

## Scenarios

The suite fixes today at **2026-11-20** (Friday, the calendars' clock). Every scenario passes an
explicit `locale` (the query's, else `en-US`); the expected names, orders and texts are computed in
the browser with its own `Intl` (no literal of a locale is hard-coded: engines write them
differently). Output lines: `value: <ISO or none>`, `reason: <reason>`, or `form: <entries or
none>`.

### `/date-field/basic`

A `Field.Root` with `Field.Label` **"Birth date"** and a `DateField.Root` (`locale` from the query,
default `en-US`) whose Input renders each segment through its children function with a Segment.
Output: `value`, `reason`.

Checks (`en-US`):

1. A `group` named "Birth date" holds three `spinbutton`s, in the order month, day, year, named
   "Birth date" and their `Intl.DisplayNames` names ("Birth date month"); each a tab stop, a
   placeholder with no `aria-valuenow`, its `aria-valuemin` / `aria-valuemax` (month 1–12).
2. Typing `1`, `1` in the month sets it (`aria-valuenow="11"`, `aria-valuetext` the month's long
   name) and moves the focus to the day; `2`, `3` to the year; `2`, `0`, `2`, `6`:
   `value: 2026-11-23`, `reason: input-change` (each digit of the year already makes a complete
   value, `0202-11-23` on the way: a year is any number from 1).
3. `4` in an empty month sets April and moves on at once; `0` waits, showing the locale's `0`,
   then `5` sets May.
4. On the year: ArrowUp → 2027 (`reason: keyboard`), ArrowDown ×2 → 2025, Page Up → 2030; on the
   day: End → 30 (November's last), Home → 1, ArrowDown → 30 (wraps).
5. ArrowLeft from the year focuses the day, ArrowRight the year again.
6. Backspace ×4 on the year empties it: `value: none`, `reason: input-clear`; Backspace again
   moves the focus to the day.
7. ArrowUp on an empty month gives the placeholder's month (November, today's).
8. A press on the label focuses the month.
9. Typing `1`, `1` then ArrowRight moves the focus between segments with no blur: the Field
   has `data-focused` and no `data-touched`; leaving the field gives it `data-touched`.
10. Axe finds no violation, empty and filled.
11. Contract layer: the parts, `data-type` on every segment, `data-placeholder` on the empty ones,
    `aria-hidden` literals, the structural bidi style on the numeric segments, no `"false"` state
    attribute; the hidden input (`type="date"`) follows the Root.

### `/date-field/basic?locale=de-DE`

Checks: the segments are in the order day, month, year (as `Intl` writes `de-DE`), named in German
(`Intl.DisplayNames`); typing `2`, `3`, `1`, `1`, `2`, `0`, `2`, `6` gives `value: 2026-11-23`.

### `/date-field/basic?locale=he-IL&dir=rtl`

Checks: the segments are in the document order day, month, year, and on screen **left to right**
(the day's box left of the month's, the month's left of the year's), empty and filled; ArrowRight
from the day focuses the month. Typing `2`, `3`, `1`, `1`, `2`, `0`, `2`, `6` gives
`value: 2026-11-23`.

### `/date-field/basic?locale=ar-EG&dir=rtl`

Checks: typing ASCII `2`, `3` in the day shows Arabic-Indic digits (`٢٣`, the browser's `Intl`)
with `aria-valuenow="23"`; the segments are on screen **right to left** (the day rightmost);
ArrowLeft from the day focuses the month. Typing `1`, `1`, `2`, `0`, `2`, `6` then gives
`value: 2026-11-23`.

### `/date-field/min-max`

A DateField (`en-US`) whose Input has `aria-label` **"Arrival"**, `min` 2026-11-10, `max`
2026-12-05, weekends unavailable (`isDateUnavailable`). Output: `value`.

Checks:

1. Typing 11/09/2026: `value: 2026-11-09`; the Root has `data-invalid`, each segment
   `aria-invalid="true"`; the hidden input's validity is `rangeUnderflow`.
2. Typing `2`, `0` into the day (November 20): valid, no `data-invalid`, no `aria-invalid`.
3. The day 21 (a Saturday): invalid (`data-invalid`), the hidden input's validity valid
   (unavailable has no native validity).
4. 12/06/2026: invalid, `rangeOverflow`.
5. Axe finds no violation while invalid.
6. Contract layer: the hidden input's `min="2026-11-10"`, `max="2026-12-05"`.

### `/date-field/form`

A native `<form>`: a Field **"Birth date"** (`name="birth"`) around a required DateField; a
DateField `name="start"`, `readOnly`, `defaultValue` 2026-11-20, its Input `aria-label`
**"Start"**; a DateField `name="end"`, `disabled`, `defaultValue` 2026-11-27, its Input
`aria-label` **"End"**; **"Submit"** and **"Reset"** buttons; all `en-US`. Output: `form`.

Checks:

1. "Submit" submits nothing (`form: none`) and focuses Birth date's month.
2. Typing 11/23/2026, then "Submit": `form: birth=2026-11-23&start=2026-11-20` (the disabled field
   submits nothing).
3. Start's month is focusable; ArrowUp changes nothing (read-only); its segments have
   `aria-readonly="true"` and no `contenteditable`.
4. End's segments have no `tabindex` and `aria-disabled="true"`.
5. "Reset" makes Birth date's segments placeholders again; "Submit" submits nothing again.
6. Axe finds no violation.
7. Contract layer: the Roots carry `data-required`, `data-readonly`, `data-disabled`.

### `/date-field/date-time`

A Field **"Meeting"** (`name="meeting"`) around a DateField with `granularity="minute"` (`locale`
from the query, default `en-US`), inside a native `<form>` with **"Submit"**. Output: `value`,
`form`.

Checks (`en-US`, a 12-hour locale):

1. Six spinbuttons, in the order month, day, year, hour, minute, day period (as `Intl` writes
   `en-US`); the hour's range is 1–12.
2. Typing 11/23/2026, then `2` (the hour moves on: `20` is no hour of a 12-hour clock), `3`, `0`,
   then the PM letter: `value: 2026-11-23T14:30`.
3. ArrowDown on the day period: `value: 2026-11-23T02:30` (`reason: keyboard`).
4. "Submit": `form: meeting=2026-11-23T02:30`; the hidden input is `type="datetime-local"`.

### `/date-field/date-time?locale=de-DE`

Checks (a 24-hour locale): five spinbuttons, day, month, year, hour, minute; no day period; the
hour's range is 0–23; typing `2`, `3`, `1`, `1`, `2`, `0`, `2`, `6`, `1`, `4`, `3`, `0` gives
`value: 2026-11-23T14:30`.

### `/time-field/basic`

A Field **"Meeting time"** around a TimeField (`locale` from the query, default `en-US`). Output:
`value`, `reason`.

Checks (`en-US`):

1. A `group` named "Meeting time" with three spinbuttons: hour (1–12), minute (0–59), day period
   (0–1), named "Meeting time" and their names.
2. Typing `9` moves on at once; `3`, `0`, then the PM letter: `value: 21:30`,
   `reason: input-change`; the day period's `aria-valuetext` is the locale's PM text.
3. ArrowUp on the day period: `value: 09:30` (`reason: keyboard`).
4. On the hour: ArrowUp ×3 → 12 (`value: 00:30`, still AM: the hour stays in its half of the
   day); ArrowUp → 1 (`value: 01:30`).
5. Typing the AM letter in the day period keeps AM; Backspace there makes it a placeholder:
   `value: none`, `reason: input-clear`.
6. Axe finds no violation.

### `/time-field/basic?locale=de-DE`

Checks (a 24-hour locale): two spinbuttons, hour (0–23) and minute; no day period; typing `1`,
`4`, `3`, `0` gives `value: 14:30`.

### `/time-field/min-max`

A TimeField (`en-US`, `hourCycle={24}`, `granularity="second"`) whose Input has `aria-label`
**"Opening"**, `min` 09:00, `max` 17:00, `defaultValue` 09:00:00. Output: `value`.

Checks:

1. Three spinbuttons (hour 0–23, minute, second), no day period; the hidden input
   `type="time"`, `min="09:00:00"`, `max="17:00:00"`, value `09:00:00`; valid.
2. ArrowDown on the hour: `value: 08:00:00`, `data-invalid`, `rangeUnderflow`.
3. Home, then ArrowDown (00 − 1 wraps to 23): `value: 23:00:00`, still invalid
   (`rangeOverflow`): stepping across midnight is no range.
4. Typing `1`, `2`: `value: 12:00:00`, valid.

### `/time-field/form`

A native `<form>`: a TimeField `name="alarm"`, `required`, `hourCycle={24}`, its Input
`aria-label` **"Alarm"**; a TimeField `name="start"`, `readOnly`, `defaultValue` 08:00, its Input
`aria-label` **"Start"**; **"Submit"** and **"Reset"**; `en-US`. Output: `form`.

Checks:

1. "Submit" submits nothing and focuses Alarm's hour.
2. Typing `0`, `7`, `3`, `0`, then "Submit": `form: alarm=07:30&start=08:00`.
3. "Reset": Alarm's segments are placeholders again; "Submit" is blocked again (focus on Alarm's
   hour).
4. Axe finds no violation.

## Differences from React Aria

The APG has no date field and Base UI has no date component, so the behaviour reference is React
Aria's `DateField` / `TimeField` (Zag and Ark's date input as a second reading); these are the
decided points (`docs/decisions.md`, "Segmented fields"):

| point | decision | reason |
| --- | --- | --- |
| The segment's role | each editable segment a `spinbutton` with `aria-valuenow` / `aria-valuetext` / `aria-valuemin` / `aria-valuemax`, a tab stop of its own, in a `group` | the APG spinbutton, the APG-closest pattern (React Aria's choice too) |
| A placeholder's text | one en dash per digit; React Aria writes a localized `mm/dd/yyyy` from its own table | no text of ours (spec/README.md): the dashes carry no language; the consumer writes its own |
| A placeholder's `aria-valuetext` | none (no `aria-valuenow` either); React Aria says "Empty" | no text; the APG spinbutton allows a spinbutton with no value |
| A segment's name | `Intl.DisplayNames` (`dateTimeField`), the locale data exception; React Aria the same `Intl` names | data from `Intl`, which the consumer can replace |
| A month's `aria-valuetext` | its long name alone ("November"); React Aria "11 – November" | no text of ours to join them |
| ArrowLeft / ArrowRight | measured on screen in every direction | one rule for LTR and RTL; React Aria measures in RTL only |
| The bounds' names | `min`, `max` (React Aria `minValue`, `maxValue`, the Issue's) | the calendars' and pickers' names in this library |
| An unavailable date | invalid (`data-invalid`, `aria-invalid`), no native validity; React Aria sets its own localized message | no text of ours; `validate` gives the message |
| A 12-hour hour's step | wraps within its half of the day | React Aria's `cycle`, kept |
| Two-digit years | not expanded | React Aria's behaviour; a year is typed in full |
| The form value | one hidden native `date` / `datetime-local` / `time` input with `min` / `max` | the native range validity (`rangeUnderflow`, `rangeOverflow`) with the browser's own messages; React Aria's hidden input is a text input |
