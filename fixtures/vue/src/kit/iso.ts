import type { DateRange, PlainDate } from "@fragiola/primitives-vue/calendar";

const pad = (value: number, size: number) => String(value).padStart(size, "0");

/** `2026-11-20`, as the scenarios print dates (spec/calendar.md, "Dates"). */
export function iso(date: PlainDate | null | undefined): string | undefined {
    return date
        ? `${pad(date.year, 4)}-${pad(date.month, 2)}-${pad(date.day, 2)}`
        : undefined;
}

/** `2026-11-10..2026-11-15` */
export function isoRange(
    range: DateRange | null | undefined,
): string | undefined {
    return range ? `${iso(range.start)}..${iso(range.end)}` : undefined;
}

/** `14:30`, or `14:30:05` with `seconds` (spec/date-field.md, "Scenarios"). */
export function isoTime(
    time: { hour: number; minute: number; second: number } | null | undefined,
    seconds = false,
): string | undefined {
    if (!time) {
        return undefined;
    }
    const base = `${pad(time.hour, 2)}:${pad(time.minute, 2)}`;
    return seconds ? `${base}:${pad(time.second, 2)}` : base;
}

/** A date, or a date and time (`2026-11-23T14:30`) when it has an hour. */
export function isoDateTime(
    value:
        | (PlainDate & { hour?: number; minute?: number; second?: number })
        | null
        | undefined,
): string | undefined {
    if (!value) {
        return undefined;
    }
    return value.hour === undefined
        ? iso(value)
        : `${iso(value)}T${isoTime({ hour: value.hour, minute: value.minute ?? 0, second: value.second ?? 0 })}`;
}
