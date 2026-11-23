// The entry of @fragiola/primitives/time: the plain time (`{ hour, minute, second, millisecond }`)
// and the plain date and time (a `PlainDate` and a `PlainTime` in one), with no time zone; their
// comparison, their math and their ISO text. Only the date and time fields import it.

export {
    addDateTime,
    compareDateTimes,
    currentDateTime,
    type DateTimeDuration,
    fromIsoDateTime,
    isSameDateTime,
    type PlainDateTime,
    plainDateTime,
    toIsoDateTime,
    toPlainDate,
    toPlainTime,
} from "./plain-date-time.ts";
export {
    addTime,
    compareTimes,
    currentTime,
    cycleTime,
    fromIsoTime,
    type IsoTimePrecision,
    isSameTime,
    type PlainTime,
    plainTime,
    type TimeDuration,
    type TimeField,
    type TimeRange,
    toIsoTime,
} from "./plain-time.ts";
