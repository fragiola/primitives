# Time zones

## Purpose

The date-time fields and pickers can hold **zoned values**: a date and a wall-clock time in an
IANA time zone, with the DST handling of Temporal. A meeting at 09:00 in New York stays 09:00 in
New York when the clocks change, and a time the zone skips or repeats resolves the way the app
chose.

**Scope: stage 3** (Epic #82, Issue #81). Written **in-house on `Intl`, with no date library**
(the maintainer's decision of 2026-11-23; AGENTS.md rule 2 stands). The APG and Base UI say
nothing about time zones; Temporal's `ZonedDateTime` (its `disambiguation`, offsets and ISO text)
and React Aria's zoned fields are behaviour references only.

## Values

`@fragiola/primitives/time-zone` (a toolkit entry of its own):

- **`ZonedDateTime`**: a `PlainDateTime` (`{ year, month, day, hour, minute, second,
  millisecond }`, the wall-clock time) with its **`timeZone`** (an IANA id) and its **`offset`**
  from UTC in milliseconds (positive east: `+05:30` is `19800000`). The offset tells the two
  times of a DST overlap apart; it is a `PlainDateTime`, so the calendars and the date math take
  it as a date.
- **`offsetAt(timeZone, epochMs)`**: the zone's offset at an instant, read from `Intl` (the
  wall-clock fields `Intl.DateTimeFormat` writes there, less the instant).
- **`fromInstant(instant, timeZone)`**, **`toInstant(zoned)`** (epoch milliseconds or a `Date`),
  **`toTimeZone`**, **`compareZoned`** (by instant), **`localTimeZone()`** (`Intl`'s default).
- **`toZoned(dateTime, timeZone, disambiguation)`**: a wall-clock time in a zone, see below.
- **`addZoned`** (Temporal's `add`: years, months and days in wall time, resolved `compatible`;
  hours and smaller in exact time) and **`cycleZoned`** (one field, wrapping: the hour walks the
  day's real hours, 23 on a spring-forward day and 25 on a fall-back one).
- **ISO text** (RFC 9557, Temporal's `ZonedDateTime#toString`): `toIsoZoned` writes
  `2026-11-01T01:30-05:00[America/New_York]`; `fromIsoZoned` reads it (the offset picks one of an
  overlap's two times when the zone has it there, else the wall time is resolved).
- **`formatTimeZoneName(locale, zoned)`**: the zone's short name at the value's instant ("EST",
  "EDT", "GMT+5:30"), from `Intl`.
- **`timeZone(id?)`**: the zone a field takes (below); default the page's own.

### DST gaps and overlaps

A wall-clock time names one instant, none (a **gap**: 02:30 on a spring-forward night) or two (an
**overlap**: 01:30 on a fall-back night). **`disambiguation`** is Temporal's:

| disambiguation | gap (02:30 skipped, 02:00 → 03:00) | overlap (01:30 twice) |
| --- | --- | --- |
| `compatible` (default) | later: 03:30 (forward by the gap) | earlier: the first 01:30 |
| `earlier` | 01:30 (back by the gap) | the first 01:30 |
| `later` | 03:30 | the second 01:30 |
| `reject` | a `RangeError` | a `RangeError` |

The toolkit is unit tested across DST changes in America/New_York, Europe/London,
Australia/Lord_Howe (a 30-minute DST) and Asia/Kolkata (none).

## In the fields

DateField, DateRangeField, DatePickerInput and DateRangePickerInput take **`timeZone`**, a zone
from `timeZone("America/New_York")`, and **inject** it: no component imports `/time-zone`, so a
field given none bundles none of its code (the bundle guard's `MECHANISM_USERS` lists no entry).
TimeField and TimeRangeField have no date, so no zone.

The zone carries the code it changes (Epic #88): the segments call its hooks (`segmentOptions`
for the `timeZoneName` part, `segmentText` for its name, `wallTime` for a value from another zone,
`segmentsToDateTime` for the typed wall time resolved), and a picker its `choose` (`reject` read
as `compatible`), so a field given no zone pays only for the hook calls.

- The values are **`ZonedDateTime`s in that zone**. A value from another zone is shown at the
  same instant in the field's zone.
- With a time granularity, the field shows a **time zone segment** where the locale writes the
  zone (`timeZoneName: "short"`): its text the zone's name at the value's instant (it turns from
  "EDT" to "EST" as the value crosses the change), a `span` with `data-type="timeZoneName"`, not
  a `spinbutton` and not hidden (it is part of what the field says). **`hideTimeZone`** leaves it
  out.
- **The segments keep the wall time the user typed**; the value is that wall time resolved with
  **`disambiguation`** (default `compatible`). Typing 2:30 AM on 2026-03-08 in New York shows
  2:30 AM and reports `2026-03-08T03:30-04:00[America/New_York]`. With `reject`, a skipped or
  repeated wall time makes no value (`null`, as an incomplete entry).
- A picker's chosen date takes the typed time (Epic #76) and resolves it the same way
  (`reject` resolves `compatible` there: a press must choose something).
- `min` and `max` are compared as wall times in the field's zone.
- **Forms**: the hidden input submits the zoned ISO text
  (`departure=2026-11-01T01:30-05:00[America/New_York]`); a range field's two inputs, and a range
  picker's interval (`start/end`), likewise. The zoned text is no native date type, so the hidden
  input is `type="text"`: `required` still gives `valueMissing`, but out of range has no native
  `rangeUnderflow` / `rangeOverflow` (the field's `data-invalid` and a Field's `validate` remain).

## Scenarios

The suite fixes today at **2026-11-20** and every value names its zone, so no scenario depends on
the host's time zone. Zone names are computed with `Intl` in the browser running the test.

### `/time-zones/field`

A form with three DateFields in Fields, granularity `minute`, en-US, zone America/New_York:
**"Departure"** (`name` `departure`, default value 2026-11-01 01:30 resolved `earlier`, the first
01:30, EDT), **"Return"** (`name` `return`, `disambiguation="later"`, no value), **"Arrival"**
(`name` `arrival`, zone Europe/London, `hideTimeZone`); a DateRangeField **"Stay"** (zone
America/New_York, `startName` `from`, `endName` `to`); a "Submit" button. Output:
`departure: <ISO>`, `return: <ISO>`, `stay: <start ISO>/<end ISO>`, `form: <entries>`.

Checks:

1. Departure's segments read 11/1/2026, 1:30 AM, then a time zone segment reading `Intl`'s short
   name of America/New_York at 2026-11-01T05:30Z ("EDT"): a `span`, not a spinbutton, not
   `aria-hidden`.
2. ArrowUp on Departure's hour: `departure: 2026-11-01T02:30-05:00[America/New_York]`; the zone
   segment reads the name at 07:30Z ("EST").
3. Return, typed `03082026` `0230` `A` (a time New York skips): the segments keep 2:30 AM;
   `return: 2026-03-08T03:30-04:00[America/New_York]` (`later`).
4. Return, its date and hour typed again to 11/01/2026 1:30 AM (an overlap): `return:
   2026-11-01T01:30-05:00[America/New_York]` (`later`: the second 01:30).
5. Arrival has no time zone segment.
6. Stay, typed `11012026` `0130` `A` then `11022026` `0900` `A`: `stay:
   2026-11-01T01:30-04:00[America/New_York]/2026-11-02T09:00-05:00[America/New_York]`.
7. Submit: the form submits `departure`, `return`, `from` and `to` as their zoned ISO texts.
8. Axe finds no violation.
9. Contract layer: the time zone segment carries `date-field-segment` and
   `data-type="timeZoneName"`, no `role`; the hidden inputs are `type="text"` and hold the zoned
   ISO texts.

### `/time-zones/picker`

A DatePickerInput in a Field labelled **"Meeting"** (granularity `minute`, en-US, zone
America/New_York, `name` `meeting`, default value 2026-03-07 02:30 EST, a Trigger "Choose date"
opening a Calendar) and a DateRangePickerInput labelled **"Trip"** (zone America/New_York,
granularity `minute`, `name` `trip`, a Trigger "Choose dates"). Output: `meeting: <ISO>`,
`trip: <ISO interval>`.

Checks:

1. Meeting's zone segment reads `Intl`'s name of America/New_York at 2026-03-07T07:30Z ("EST").
2. "Choose date", ArrowRight (2026-03-08, the spring-forward day), Enter: the popup closes;
   `meeting: 2026-03-08T03:30-04:00[America/New_York]` (02:30 is skipped there: `compatible`
   forward); the segments read 3:30 AM and the zone segment the name at 07:30Z ("EDT").
3. Trip, "Choose dates": Enter on the focused 2026-11-20, ArrowRight, Enter:
   `trip: 2026-11-20T00:00-05:00[America/New_York]/2026-11-21T00:00-05:00[America/New_York]` (the
   placeholder's midnight).
4. Axe finds no violation, the popup open and closed.

## Recorded limits

- **Zone names differ between engines**: `Intl`'s short names come from each engine's ICU, and
  Node and Chromium disagree for some zones and locales (Europe/London in `en-US`: Node writes
  "GMT", Chromium "GMT+0"; found by the ssr layer, React's hydration error #418). A server render
  of a zoned field whose zone name differs from the browser's hydrates with a text mismatch: the
  scenarios use a zone both write alike (America/New_York: "EST", "EDT"); an app rendering such a
  field on a server can pass `hideTimeZone`. The toolkit's names are unit tested against the
  engine's own `Intl`.
- **Engines**: an engine without a zone's data throws `RangeError` from `Intl` (an unknown zone);
  `fromIsoZoned` returns `null` for one.

## Differences from Temporal and React Aria

- **Offsets in milliseconds** (React Aria's), not Temporal's nanoseconds.
- **A field's zone is an injected object** (`timeZone("…")`), not a value's zone alone: a field
  with no value still knows its zone, and no field bundles zone code it is not given.
- **Hour steps in a field move the wall time** (2 AM in a gap resolves forward, an overlap's
  hour gives its `disambiguation`'s time); `cycleZoned` walks the real hours (React Aria's field
  behaviour) for apps that want it. Recorded: a field's ArrowUp from the first 1:30 of an overlap
  goes to 2:30, not to the second 1:30.
