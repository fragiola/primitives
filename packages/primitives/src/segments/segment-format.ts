import type { CalendarSystem } from "../calendar-systems/calendar-system.ts";
import type { TimeZone } from "../time-zone/time-zone.ts";
import type { Disambiguation } from "../time-zone/zoned-date-time.ts";

/** What a segment of a date or time field shows (spec/date-field.md, "Segments"). */
export type SegmentType =
    | "era"
    | "year"
    | "month"
    | "day"
    | "hour"
    | "minute"
    | "second"
    | "dayPeriod"
    | "timeZoneName"
    | "literal";

/**
 * The segments the user edits; the others (`literal`, `timeZoneName`) are only shown, and an
 * `era` only in a calendar system of several eras (spec/calendar-systems.md, "In the fields").
 */
export type EditableSegmentType =
    | "era"
    | "year"
    | "month"
    | "day"
    | "hour"
    | "minute"
    | "second"
    | "dayPeriod";

/** The smallest unit a field edits: `day` for a date alone, else the time down to it. */
export type SegmentGranularity = "day" | "hour" | "minute" | "second";

/** What a field holds: a date (and, finer than `day`, its time) or a time alone. */
export type SegmentKind = "date" | "time";

/** `Intl`'s hour cycles: 0–11, 1–12, 0–23, 1–24. */
export type HourCycle = "h11" | "h12" | "h23" | "h24";

export interface SegmentFormatOptions {
    /** BCP 47. */
    readonly locale: string;
    readonly kind: SegmentKind;
    /** Default: `day` for a date, `minute` for a time (a time's `day` reads as `minute`). */
    readonly granularity?: SegmentGranularity | undefined;
    /** `12` or `24` (the locale picks `h11` or `h12` for 12), or an exact cycle; default: the locale's. */
    readonly hourCycle?: 12 | 24 | HourCycle | undefined;
    /**
     * A calendar system (spec/calendar-systems.md): the segments show and edit its fields; values
     * stay ISO. Default: none (the ISO calendar, as the locale writes it).
     */
    readonly calendar?: CalendarSystem | undefined;
    /**
     * A time zone (spec/time-zones.md): the values are `ZonedDateTime`s in it, and a date and
     * time shows a `timeZoneName` segment unless `hideTimeZone`.
     */
    readonly timeZone?: TimeZone | undefined;
    readonly hideTimeZone?: boolean | undefined;
    /** How a wall time the zone skips or repeats resolves (default `compatible`). */
    readonly disambiguation?: Disambiguation | undefined;
}

/** One piece of the format, in the locale's order: a segment, or the literal text between. */
export interface SegmentPart {
    readonly type: SegmentType;
    /** The text of a `literal` (or `era`) part, as `Intl` writes it; `""` for the others. */
    readonly literal: string;
}

/**
 * A field's format for a locale (from `Intl.DateTimeFormat#formatToParts`): the order of its
 * segments and the literals between them, its hour cycle, its digits and the texts `Intl` gives
 * for the day periods and the segments' names. Built once per locale and options.
 */
export interface SegmentFormat {
    readonly locale: string;
    readonly kind: SegmentKind;
    readonly granularity: SegmentGranularity;
    readonly parts: readonly SegmentPart[];
    /** The editable segments, in the locale's order. */
    readonly types: readonly EditableSegmentType[];
    /** `null` when the format has no hour. */
    readonly hourCycle: HourCycle | null;
    /** The locale's ten digits, 0 to 9 (`Intl`'s numbering system). */
    readonly digits: readonly string[];
    /** The day period texts, AM then PM (`["", ""]` when the format has none). */
    readonly dayPeriods: readonly [string, string];
    /** Each segment's name, from `Intl.DisplayNames` (`dateTimeField`), when the engine has it. */
    readonly names: Readonly<Partial<Record<SegmentType, string>>>;
    /** Formats a UTC date in the field's segments (`timeZone: "UTC"`). */
    readonly formatter: Intl.DateTimeFormat;
    /** Formats a UTC date's month name (`month: "long"`), the month's `aria-valuetext`. */
    readonly monthNames: Intl.DateTimeFormat;
    /** The calendar system, when the field has one. */
    readonly calendar?: CalendarSystem | undefined;
    /** The eras' names (`era: "short"`), oldest first, when the era is editable. */
    readonly eras?: readonly string[] | undefined;
    /** The time zone, when the field holds zoned values. */
    readonly timeZone?: TimeZone | undefined;
    readonly disambiguation?: Disambiguation | undefined;
}

const EDITABLE = /* @__PURE__ */ new Set<string>([
    "year",
    "month",
    "day",
    "hour",
    "minute",
    "second",
    "dayPeriod",
]);

/** A UTC `Date` of the fields, years 0–99 included (`Date.UTC` reads them as 19xx). */
export function utcDate(
    year: number,
    month: number,
    day: number,
    hour = 0,
    minute = 0,
    second = 0,
): Date {
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(hour, minute, second, 0);
    return date;
}

function formatOptions(
    kind: SegmentKind,
    granularity: SegmentGranularity,
    hourCycle: SegmentFormatOptions["hourCycle"],
    zoneName: boolean,
): Intl.DateTimeFormatOptions {
    const options: Intl.DateTimeFormatOptions = { timeZone: "UTC" };
    if (kind === "date") {
        options.year = "numeric";
        options.month = "numeric";
        options.day = "numeric";
    }
    if (granularity !== "day") {
        options.hour = "numeric";
        if (granularity !== "hour") {
            options.minute = "2-digit";
        }
        if (granularity === "second") {
            options.second = "2-digit";
        }
        if (hourCycle === 12) {
            // the locale's 12-hour cycle: h12 (1–12), or h11 (0–11) where it writes that
            options.hour12 = true;
        } else if (hourCycle === 24) {
            options.hourCycle = "h23";
        } else if (hourCycle !== undefined) {
            options.hourCycle = hourCycle;
        }
        if (zoneName && kind === "date") {
            // where the locale writes it; its text is the field's zone's (`dateSegments`)
            options.timeZoneName = "short";
        }
    }
    return options;
}

/**
 * A literal with its spaces as one kind: engines write the space before a day period as U+0020,
 * U+00A0 or U+202F depending on their ICU (Node and Chromium differ), so a server render and its
 * hydration would disagree; the bidirectional marks stay.
 */
function normalizeLiteral(text: string): string {
    return text.replace(/[\u00a0\u2007\u202f]/g, " ");
}

function partType(type: string): SegmentType {
    return EDITABLE.has(type) || type === "era" || type === "timeZoneName"
        ? (type as SegmentType)
        : "literal";
}

/** The ten digits of a locale's numbering system. */
function localeDigits(locale: string, numberingSystem: string): string[] {
    const format = new Intl.NumberFormat(locale, {
        numberingSystem,
        useGrouping: false,
    });
    return Array.from({ length: 10 }, (_, digit) => format.format(digit));
}

function segmentNames(locale: string): Partial<Record<SegmentType, string>> {
    const Names = Intl.DisplayNames as typeof Intl.DisplayNames | undefined;
    if (Names === undefined) {
        return {};
    }
    try {
        const names = new Names(locale, { type: "dateTimeField" });
        const result: Partial<Record<SegmentType, string>> = {};
        for (const type of [
            "era",
            "year",
            "month",
            "day",
            "hour",
            "minute",
            "second",
            "dayPeriod",
            "timeZoneName",
        ] as const) {
            const name = names.of(type);
            if (name !== undefined) {
                result[type] = name;
            }
        }
        return result;
    } catch {
        // an engine without the `dateTimeField` names: the consumer names the segments
        return {};
    }
}

/**
 * The format of a date or time field in a locale (spec/date-field.md, "Segments"): the parts of
 * `Intl.DateTimeFormat#formatToParts` for the field's segments, in the locale's order, with its
 * literals, hour cycle and digits.
 */
export function segmentFormat(options: SegmentFormatOptions): SegmentFormat {
    const { locale, kind, calendar, timeZone } = options;
    // a calendar system's names and digits: the locale with its `-u-ca-`
    const intlLocale = calendar ? calendar.locale(locale) : locale;
    const granularity: SegmentGranularity =
        options.granularity === undefined ||
        (kind === "time" && options.granularity === "day")
            ? kind === "time"
                ? "minute"
                : "day"
            : options.granularity;
    const formatter = new Intl.DateTimeFormat(
        intlLocale,
        formatOptions(
            kind,
            granularity,
            options.hourCycle,
            timeZone !== undefined && !options.hideTimeZone,
        ),
    );
    const resolved = formatter.resolvedOptions();
    // a sample whose fields are all two digits, and in the afternoon
    const parts: SegmentPart[] = [];
    for (const part of formatter.formatToParts(
        utcDate(2026, 11, 23, 14, 35, 45),
    )) {
        const type = partType(part.type);
        const previous = parts[parts.length - 1];
        if (type === "literal" && previous?.type === "literal") {
            parts[parts.length - 1] = {
                type,
                literal: previous.literal + normalizeLiteral(part.value),
            };
            continue;
        }
        parts.push({
            type,
            literal:
                type === "literal"
                    ? normalizeLiteral(part.value)
                    : type === "era"
                      ? part.value
                      : "",
        });
    }
    // an era is edited only where there are several to choose from (a Japanese date's)
    const eraCount = calendar?.eraCount() ?? 1;
    const types = parts
        .map((part) => part.type)
        .filter(
            (type): type is EditableSegmentType =>
                EDITABLE.has(type) || (type === "era" && eraCount > 1),
        );
    const hasHour = types.includes("hour");
    const period = (hour: number) =>
        formatter
            .formatToParts(utcDate(2026, 11, 23, hour))
            .find((part) => part.type === "dayPeriod")?.value ?? "";
    return {
        locale,
        kind,
        granularity,
        parts,
        types,
        hourCycle: hasHour ? (resolved.hourCycle ?? "h23") : null,
        digits: localeDigits(locale, resolved.numberingSystem),
        dayPeriods: types.includes("dayPeriod")
            ? [period(0), period(12)]
            : ["", ""],
        names: segmentNames(locale),
        formatter,
        monthNames: new Intl.DateTimeFormat(intlLocale, {
            month: "long",
            timeZone: "UTC",
        }),
        calendar,
        eras:
            calendar && types.includes("era")
                ? Array.from({ length: eraCount }, (_, era) =>
                      calendar.eraName(locale, era),
                  )
                : undefined,
        timeZone,
        disambiguation: options.disambiguation,
    };
}
