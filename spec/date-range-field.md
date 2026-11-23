# DateRangeField, TimeRangeField

## Purpose

- **DateRangeField**: a start date and an end date typed in segments, as two
  [DateField](date-field.md) inputs in one control (a stay's check-in and check-out); with a time
  granularity, a start and an end date and time.
- **TimeRangeField**: a start time and an end time of day typed in segments (opening hours).

Both are form controls: they work in a native `<form>` (two ISO values, validated and reset) and
in a [Field](field.md). A range chosen on a month grid is a [RangeCalendar](calendar.md); a picker
that opens one, with or without a typed input, a [DateRangePicker](calendar.md).

**Scope: stage 3** (Epic #76, Issue #74). The APG has no date field and Base UI has no date
component (`docs/catalog.md`), so D4 falls back to the APG-closest option, as for the single
fields: each editable segment is an APG `spinbutton`, the segments of each end sit in a `group`
the consumer names ("Start date", "End date"), and the behaviour the APG leaves open follows React
Aria's `DateRangePicker` field half as a behaviour reference only (Zag and Ark's range input as a
second reading; nothing copied). Each choice is in "Differences from React Aria" and
`docs/decisions.md` ("Range fields and typed picker input").

Everything a segment does (its values, typing, keys, placeholders, bidirectional text, the locale
data exception) is [date-field.md](date-field.md)'s; this page says what a range adds.

## Values

A DateRangeField's value is a **`DateRange`** (`{ start, end }`, `@fragiola/primitives/date`, the
calendars' range type) of `PlainDate`s, or of `PlainDateTime`s with a time granularity. A
TimeRangeField's value is a **`TimeRange`**, `{ start, end }` of `PlainTime`s (a type of the
toolkit's `/time`, added by this Epic; type only, so `/time`'s code is unchanged).

The value is **set only once every segment of both ends is**: until then it is `null`, and the
segments already set wait in the field's own state, as a single field's. A value whose end is
before its start is still the value (the user typed it): it is **invalid**
([Validation](#validation)), as a value out of range is.

A value from outside replaces both ends' segments; a `null` one only when every segment is set (a
partly typed range keeps what it holds), and the value the segments just reported coming back
changes nothing (date-field.md, "Values").

## Anatomy

DateRangeField and TimeRangeField share their parts; each part's attribute names the root it sits
in (`date-range-field-<part>` / `time-range-field-<part>`, spec/README.md "Part attribute").

| part | element | `data-primitives-part` (DateRangeField / TimeRangeField) | notes |
| --- | --- | --- | --- |
| Root | `div` | `date-range-field-root` / `time-range-field-root` | holds the value and both ends' segments; renders the two hidden inputs after its children |
| Input | `div` | `date-range-field-input` / `time-range-field-input` | `role="group"`: one end's segments (`range="start"` or `"end"`); children function per segment, or every segment |
| Segment | `span` | `date-range-field-segment` / `time-range-field-segment` | one segment, as DateField's |
| (hidden inputs) | `input` | `date-range-field-hidden-input` / `time-range-field-hidden-input` | two, start then end, each with `data-range="start"` / `"end"`: what the form submits and validates ([Forms](#forms)) |

Each component has its own entry in every framework package (`/date-range-field`,
`/time-range-field`, D8). The Input is the range field's own part (it picks one end of the Root's
state); the Segment is DateField's. `ENTRY_DEPENDENCIES`: `date-range-field` on `date-field` and
`field`; `time-range-field` on `date-range-field`, `date-field` and `field`. The segment editing
and the time values are the toolkit's `/segments` and `/time` (the bundle guard's
`MECHANISM_USERS` lists both entries).

## API

**DateRangeField.Root**:

- `value`, `defaultValue` (`null`), `onValueChange(value, details)`: a `DateRange` or `null`.
  `details` is `{ reason, event }`; the reasons are DateField's (`input-change`, `input-clear`,
  `keyboard`, `none`).
- `granularity` (`"day"`), `placeholderValue` (default: today at midnight), `hourCycle`, `locale`:
  as DateField's, for both ends.
- `min`, `max`: as DateField's, for both ends (the Issue's `minValue` / `maxValue` are `min` /
  `max`, as every date component's, date-field.md "API").
- `isDateUnavailable(date)`: a range whose start or end is unavailable is invalid. The dates
  between them are not checked: the RangeCalendar has no `allowsNonContiguousRanges`, so neither
  has the field (the Issue's condition).
- `startName`, `endName`: the names of the two hidden inputs ([Forms](#forms)).
- `required`, `readOnly`, `disabled` (`false`).

**TimeRangeField.Root**: the same over a `TimeRange`: `value`, `defaultValue`, `onValueChange`,
`granularity` (`"hour"`, `"minute"` (default), `"second"`), `placeholderValue` (default:
midnight), `hourCycle`, `min`, `max` (`PlainTime`), `locale`, `startName`, `endName`, `required`,
`readOnly`, `disabled`; no `isDateUnavailable`.

**Input**: `range` (required): `"start"` or `"end"`, the end whose segments it holds. Its children:
a function of each segment, else every segment with its default content. **It has no name of its
own**: the consumer names it (`aria-label="Start date"`; no built-in text). Inside a Field it is
`aria-labelledby` the Field's label and itself ("Stay Start date"); outside one, its `aria-label`
alone.

**Segment**: as DateField's (`segment`, its content and `aria-label`). Inside a Field or a named
Input, it is `aria-labelledby` the Field's label, its Input (when the Input has an `aria-label`)
and itself: "Stay Start date month".

## Typing and keys

Each end is typed as a DateField ([date-field.md](date-field.md), "Typing" and "Keyboard"); the
two ends are **one sequence of segments**:

- A segment that completes and leaves no next segment in its end moves the focus on to the first
  segment of the end (React Aria's): typing `11232026` in an empty start goes on into the end's
  month.
- Backspace on a placeholder moves the focus to the previous segment, from the end's first
  segment into the start's last.
- ArrowLeft and ArrowRight move to the editable segment on that side of the screen across both
  ends (measured, as DateField's).
- Tab and Shift+Tab move segment by segment (each one a tab stop), then out of the field.

## State attributes and ARIA

Every part carries the field's state: `data-disabled`, `data-readonly`, `data-required`,
`data-invalid` (an end out of range or unavailable, the end before the start, or the Field shows an
error), and inside a Field its state attributes. The Input adds `data-range="start"` / `"end"`.

| part | attributes |
| --- | --- |
| Input | `role="group"`, an `id`, `aria-labelledby` (the Field's label, then itself when it has an `aria-label`), `aria-describedby` (the Field's description and errors), `data-range` |
| editable Segment, literal Segment | DateField's ([date-field.md](date-field.md#state-attributes-and-aria)), `aria-invalid="true"` on every segment of both ends while the range is invalid |
| hidden inputs | DateField's: `type` (`date`, `datetime-local` or `time`), `name`, `value`, `min`, `max`, `step="any"`, `required`, `disabled`, `aria-hidden="true"`, `tabindex="-1"`, `data-range` |

## Focus

- Each editable segment is a tab stop; a disabled field has none.
- A press on the Field's label focuses the start's first segment.
- A form whose validation fails at the field focuses the first segment of the end that fails it
  (the start for a missing value).
- Leaving both Inputs is the field's blur; focus moving between segments, the start's and the
  end's included, is not.

## Validation

The value is **invalid** when an end is before `min` or after `max`, when (DateRangeField) an end
is unavailable, or when **the end is before the start** (the Issue's rule: Field validation). The
Root, both Inputs and every segment show it (`data-invalid`, `aria-invalid`), in or out of a Field.

The native validity follows from the hidden inputs' bounds: the start's `max` is the earlier of
`max` and the value's end, the end's `min` the later of `min` and the value's start. So an end
before the start makes the start `rangeOverflow` and the end `rangeUnderflow`: a native form
refuses it and a Field shows its error, with the browser's own messages (no text of ours). An
unavailable end has no native validity (as DateField's): a Field's `validate` gives the message.
A TimeRangeField's end before its start is invalid too: no range across midnight (as TimeField's
reversed `min` / `max`).

## Forms

The Root renders two hidden native inputs after its children, the start's then the end's,
DateField's hidden input each (`type`, ISO value at the granularity, `min`, `max` as
[Validation](#validation) says, `step="any"`, `required`, `disabled`; visually hidden,
`aria-hidden="true"`, `tabindex="-1"`), empty while the value is `null`.

- **`startName`**, **`endName`**: their names, so a form submits two entries
  (`checkin=2026-11-23&checkout=2026-11-27`), React Aria's names. A Field's `name` does not
  rename them (a range has two names; the Field's `name` still keys its Form errors).
- **`required`**: both are `required`: a native form refuses a range with no value
  (`valueMissing` on the start) and focuses the start's first segment.
- **`disabled`**, **`readOnly`**, **a form reset**: as DateField's (a reset returns both ends to
  `defaultValue`, every segment a placeholder for `null`, reason `none`).

### In a Field

The range fields are Field controls (spec/field.md, "Integration contract"), as DateField with
two Inputs: each Input is named by the field's label (and its own) and described by the field's
description and errors; a press on the label focuses the start's first segment; `validate`
receives the range (or `null`); the field's focus and blur are entering and leaving both Inputs;
the validated element is the hidden input of the first end that is invalid (else the start's);
the focus target is the start's first segment.

## RTL

As DateField's: each end keeps its locale's order and shows it as the locale's text reads. The
consumer places the two Inputs (the recipes: inline, start then end).

## Scenarios

The suite fixes today at **2026-11-20**. Every scenario passes an explicit `locale` (`en-US`);
expected names, orders and texts are computed in the browser with its own `Intl`. Output lines:
`value: <start>..<end> or none`, `reason: <reason>`, or `form: <entries or none>`.

### `/date-range-field/basic`

A `Field.Root` with `Field.Label` **"Stay"** and a DateRangeField (`en-US`), its Inputs
`aria-label` **"Start date"** (`range="start"`) and **"End date"** (`range="end"`), each rendering
its segments through a children function, with a literal **"–"** (en dash, `aria-hidden`) between
them. Output: `value`, `reason`.

Checks:

1. Two `group`s named "Stay Start date" and "Stay End date", three `spinbutton`s each (month, day,
   year, `en-US`); the start's month is named "Stay Start date" and its `Intl.DisplayNames` name.
2. Typing `1`, `1`, `2`, `3`, `2`, `0`, `2`, `6` fills the start and moves the focus to the end's
   month; nothing is reported yet (the output still reads `value: none`, `reason: none`: the
   range needs both ends).
3. Typing `1`, `1`, `2`, `7`, `2`, `0`, `2`, `6`: `value: 2026-11-23..2026-11-27`,
   `reason: input-change`.
4. ArrowLeft from the end's month focuses the start's year; ArrowRight the end's month again.
5. Backspace ×2 on the end's month (`11` → `1` → empty): `value: none`, `reason: input-clear`;
   Backspace again (on the placeholder) moves the focus to the start's year.
6. ArrowRight focuses the end's month; typing `1`, `1`: `value: 2026-11-23..2026-11-27` again
   (its day and year were kept). On the end's day, ArrowDown ×7 (27 → 20):
   `value: 2026-11-23..2026-11-20`, `reason: keyboard`; the Root has `data-invalid`, every
   segment `aria-invalid="true"`; the start's hidden input is `rangeOverflow`, the end's
   `rangeUnderflow`.
7. ArrowUp ×7 on the end's day (back to 27): valid again, no `aria-invalid`.
8. A press on the label focuses the start's month.
9. Moving from the start's year to the end's month and back (ArrowRight, ArrowLeft) is no blur: the
   Field has `data-focused` and no `data-touched`; leaving the field gives it `data-touched`.
10. Axe finds no violation, empty, filled and invalid.
11. Contract layer: the parts (`date-range-field-*`, never `date-field-*`), `data-range` on the
    Inputs and the hidden inputs, two hidden inputs `type="date"` after the Root's children,
    `data-type` on every segment, no `"false"` state attribute.

### `/date-range-field/form`

A native `<form>`: a DateRangeField `startName="checkin"`, `endName="checkout"`, `required`,
`min` 2026-11-20, its Inputs **"Check-in"** and **"Check-out"**; a DateRangeField
`startName="from"`, `endName="to"`, `readOnly`, `defaultValue` 2026-11-20..2026-11-22, its Inputs
**"From"** and **"To"**; **"Submit"** and **"Reset"** buttons; all `en-US`. Output: `form`.

Checks:

1. "Submit" submits nothing (`form: none`) and focuses Check-in's month.
2. Typing 11/23/2026 then 11/27/2026, "Submit":
   `form: checkin=2026-11-23&checkout=2026-11-27&from=2026-11-20&to=2026-11-22`.
3. On Check-out's day, ArrowDown ×5 (27 → 22), then on Check-in's day ArrowUp ×2 (23 → 25): the
   end is before the start; "Submit" submits nothing (the start is `rangeOverflow`) and focuses
   Check-in's month (the form bridge: the first segment of the first invalid end).
4. From's segments are focusable and read-only (`aria-readonly="true"`, no `contenteditable`).
5. "Reset" makes Check-in's and Check-out's segments placeholders again; "Submit" submits nothing.
6. Axe finds no violation.
7. Contract layer: the hidden inputs' names, `min="2026-11-20"` on both, the start's `max` the
   end's ISO date once both are set.

### `/time-range-field/basic`

A Field **"Opening hours"** around a TimeRangeField (`en-US`), its Inputs **"Opens"** and
**"Closes"**. Output: `value`, `reason`.

Checks:

1. Two groups named "Opening hours Opens" and "Opening hours Closes", three spinbuttons each
   (hour 1–12, minute, day period).
2. Typing `9`, `0`, `0` and the AM letter fills the start and moves the focus to the end's hour;
   typing `5`, `0`, `0` and the PM letter: `value: 09:00..17:00`, `reason: input-change`.
3. ArrowUp on the end's day period (PM → AM): `value: 09:00..05:00`, `reason: keyboard`; the Root
   has `data-invalid` (the end before the start: no range across midnight).
4. ArrowDown on it (back to PM): valid.
5. Axe finds no violation.
6. Contract layer: `time-range-field-*` parts, two hidden inputs `type="time"`, the start's
   `max="17:00"` and the end's `min="09:00"`.

## Differences from React Aria

React Aria's `DateRangePicker` is the behaviour reference for the field half (its
`DateRangePicker` has no standalone range field; React Aria Components' has none either; Zag and
Ark's date input with two `index`es is the second reading). The decided points
(`docs/decisions.md`, "Range fields and typed picker input"):

| point | decision | reason |
| --- | --- | --- |
| The ends' names | no built-in text: each Input is named by the consumer (`aria-label`) and the Field's label; React Aria writes "Start Date" / "End Date" from its string table | no text of ours (spec/README.md) |
| A segment's name in a range | the Field's label, the Input's name, the segment's name: "Stay Start date month" | the two ends' months must not share a name |
| Focus across the ends | typing on, Backspace back and the arrows cross from one end to the other; React Aria the same | the range is one control |
| An end before the start | the value is still reported, and invalid (Field validation, native `rangeOverflow` / `rangeUnderflow` from the cross bounds); React Aria reports it invalid with its own message | the browser's own messages, no text of ours; a value typed is not dropped |
| An unavailable date | a range whose start or end is unavailable is invalid; the dates between are not checked | the RangeCalendar has no `allowsNonContiguousRanges` |
| The form | two native hidden inputs, `startName` and `endName` (React Aria's names); a Field's `name` does not rename them | a native range validity per end; a DateRangePicker's one-entry interval stays the picker's |
| A time range across midnight | invalid (the end before the start) | TimeField's rule: no reversed range |
