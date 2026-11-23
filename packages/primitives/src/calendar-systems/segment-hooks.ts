import type { PlainDate } from "../date/plain-date.ts";
import type {
    EditableSegmentType,
    SegmentFormat,
    SegmentType,
} from "../segments/segment-format.ts";
import type {
    SegmentRange,
    SegmentValues,
} from "../segments/segment-values.ts";
import type { PlainDateTime } from "../time/plain-date-time.ts";
import type { CalendarSystem } from "./calendar-system.ts";
import { utcMidnight } from "./epoch-day.ts";

// The segments' hooks of a calendar system (spec/calendar-systems.md, "In the fields"): what
// `/segments` calls through a format's `calendar`, so the era, the 13-month years and the system's
// fields are code of this entry, and a field given no calendar bundles none of it (Epic #88). Each
// takes the format, whose `calendar` is the system.

/** The system of a format the hooks are called through. */
function systemOf(format: SegmentFormat): CalendarSystem {
    return format.calendar as CalendarSystem;
}

/**
 * The arithmetic year of the values: the year segment is an era's year where the era is edited
 * (the current era while it is a placeholder), else the system's year; `undefined` while the
 * year is a placeholder.
 */
function calendarYear(
    format: SegmentFormat,
    values: SegmentValues,
): number | undefined {
    if (values.year === undefined) {
        return undefined;
    }
    return format.eras
        ? systemOf(format).yearOfEra(
              values.era ?? format.eras.length - 1,
              values.year,
          )
        : values.year;
}

/** The values' year, or a year of the system's longest months while it is a placeholder. */
function sampleYear(format: SegmentFormat, values: SegmentValues): number {
    return calendarYear(format, values) ?? systemOf(format).referenceYear();
}

/**
 * The format in the system: its era is editable where the system has several (a Japanese date's),
 * with the eras' names (`era: "short"`), oldest first.
 */
export function segmentCalendarFormat(format: SegmentFormat): SegmentFormat {
    const system = systemOf(format);
    const count = system.eraCount();
    const editable: readonly SegmentType[] = format.types;
    const types = format.parts
        .map((part) => part.type)
        .filter((type): type is EditableSegmentType =>
            type === "era" ? count > 1 : editable.includes(type),
        );
    return {
        ...format,
        types,
        eras: types.includes("era")
            ? Array.from({ length: count }, (_, era) =>
                  system.eraName(format.locale, era),
              )
            : undefined,
    };
}

/** The range of the era, the month (13 in a Hebrew leap year) and the day; none for the time. */
export function segmentCalendarRange(
    format: SegmentFormat,
    values: SegmentValues,
    type: EditableSegmentType,
): SegmentRange | undefined {
    const system = systemOf(format);
    switch (type) {
        case "era":
            return { min: 0, max: (format.eras?.length ?? 1) - 1, digits: 0 };
        case "month":
            return {
                min: 1,
                max: system.monthsInYear(sampleYear(format, values)),
                digits: 2,
            };
        case "day": {
            if (values.month === undefined) {
                return { min: 1, max: 31, digits: 2 };
            }
            const year = sampleYear(format, values);
            return {
                min: 1,
                max: system.daysInMonth(
                    year,
                    Math.min(values.month, system.monthsInYear(year)),
                ),
                digits: 2,
            };
        }
        default:
            return undefined;
    }
}

/**
 * The values, completed where they are placeholders, as the UTC date `Intl` formats: the longest
 * year (a day set with no year keeps the longest month), an era set with no year its second year
 * (wholly in it).
 */
export function segmentCalendarSample(
    format: SegmentFormat,
    values: SegmentValues,
): Date {
    const system = systemOf(format);
    const date = utcMidnight(
        system.fromFields({
            year:
                calendarYear(format, values) ??
                (values.era === undefined
                    ? system.referenceYear()
                    : system.yearOfEra(values.era, 2)),
            month: values.month ?? 1,
            day: values.day ?? 1,
        }),
    );
    date.setUTCHours(
        values.hour ?? (values.dayPeriod === 1 ? 12 : 0),
        values.minute ?? 0,
        values.second ?? 0,
    );
    return date;
}

/** A value with its ISO date as the system's fields (the era's year where the era is edited). */
export function segmentCalendarFields(
    format: SegmentFormat,
    value: Partial<PlainDateTime>,
): Partial<PlainDateTime> & { era?: number } {
    if (
        value.year === undefined ||
        value.month === undefined ||
        value.day === undefined
    ) {
        return value;
    }
    const fields = systemOf(format).fields(value as PlainDate);
    return {
        ...value,
        era: fields.era,
        year: format.eras ? fields.eraYear : fields.year,
        month: fields.month,
        day: fields.day,
    };
}

/** The ISO date of the values' fields; `null` while a date segment is a placeholder. */
export function segmentCalendarDate(
    format: SegmentFormat,
    values: SegmentValues,
): PlainDate | null {
    const year = calendarYear(format, values);
    const { month, day } = values;
    return year === undefined || month === undefined || day === undefined
        ? null
        : systemOf(format).fromFields({ year, month, day });
}
