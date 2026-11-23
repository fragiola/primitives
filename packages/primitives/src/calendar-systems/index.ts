// The entry of @fragiola/primitives/calendar-systems: the 13 calendar systems of
// spec/calendar-systems.md, one export each, computed on `Intl` (no date library, no data table).
// A date component takes one as its `calendar`; values stay ISO `PlainDate`s. No component imports
// this entry: an app that passes no calendar bundles none of it.

export type {
    CalendarDateFields,
    CalendarFieldsInput,
    CalendarId,
    CalendarSystem,
    CalendarYearMonth,
} from "./calendar-system.ts";
export type { CalendarUnit, CalendarUnits } from "./calendar-units.ts";
export {
    buddhist,
    coptic,
    ethioaa,
    ethiopic,
    gregory,
    hebrew,
    indian,
    islamicCivil,
    islamicTbla,
    islamicUmalqura,
    japanese,
    persian,
    roc,
} from "./systems.ts";
