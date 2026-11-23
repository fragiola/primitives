import type { CalendarKeyOptions } from "../date/calendar-keys.ts";
import type { PlainDate } from "../date/plain-date.ts";
import { type CalendarUnits, monthUnits, yearUnits } from "./calendar-units.ts";
import {
    addDays,
    fromEpochDay,
    startOfWeek,
    toEpochDay,
    utcMidnight,
} from "./epoch-day.ts";

/** The calendar systems of spec/calendar-systems.md, by their `Intl` (CLDR) identifier. */
export type CalendarId =
    | "gregory"
    | "buddhist"
    | "japanese"
    | "roc"
    | "persian"
    | "indian"
    | "islamic-civil"
    | "islamic-tbla"
    | "islamic-umalqura"
    | "hebrew"
    | "coptic"
    | "ethiopic"
    | "ethioaa";

/**
 * An ISO date's fields in a calendar system (spec/calendar-systems.md, "Fields"). `year` is the
 * system's arithmetic year (it keeps counting across eras: Temporal's `year`); `era` is an index
 * into the system's eras (oldest first) and `eraYear` the year within it, as `Intl` writes it;
 * `month` is the month's place in its year (1–13: a Hebrew leap year's Adar I is 6).
 */
export interface CalendarDateFields {
    readonly era: number;
    readonly eraYear: number;
    readonly year: number;
    readonly month: number;
    readonly day: number;
}

/** A month of a calendar system: its arithmetic year and its place in the year. */
export interface CalendarYearMonth {
    readonly year: number;
    readonly month: number;
}

/**
 * The fields a date is built from: the arithmetic `year`, or an `era` and its `eraYear`; a month
 * or day past its year's or month's end is clamped into it (Temporal's `constrain`).
 */
export interface CalendarFieldsInput {
    readonly year?: number;
    readonly era?: number;
    readonly eraYear?: number;
    readonly month: number;
    readonly day: number;
}

/**
 * The math of one system, on days counted from 1970-01-01 (internal: each system's engine is
 * either the ISO calendar shifted, or `Intl` probed).
 */
export interface CalendarEngine {
    readonly id: CalendarId;
    /** The fields of a day. */
    fields(epochDay: number): CalendarDateFields;
    /** The first day of a month (`month` 1–`monthsInYear(year)`). */
    monthStart(year: number, month: number): number;
    monthsInYear(year: number): number;
    /** The months of the years before `year` (a month's serial number is this plus its index). */
    monthsBefore(year: number): number;
    /** How many eras the system has (1 for most). */
    readonly eraCount: () => number;
    /** The arithmetic year of an era's year. */
    yearOfEra(era: number, eraYear: number): number;
    /** A day of the era, for its name. */
    eraSample(era: number): number;
    /**
     * The place a leap year inserts its leap month at (the Hebrew Adar I, 6), so a date moved by
     * years keeps its month (Temporal's month code); `0` for none.
     */
    readonly leapMonth: number;
}

/**
 * A calendar system (spec/calendar-systems.md): the date math and the names of a non-Gregorian
 * calendar over ISO dates. Values stay ISO `PlainDate`s; a component given one shows and moves
 * through its months and years. Each system is its own export of `@fragiola/primitives/calendar-systems`,
 * so an app pays only for the systems it imports, and one that passes none pays nothing.
 */
export interface CalendarSystem {
    readonly id: CalendarId;
    /** `locale` with this calendar (`-u-ca-<id>`): `Intl` writes its names. */
    locale(locale: string): string;
    /** The fields of an ISO date. */
    fields(date: PlainDate): CalendarDateFields;
    /** The ISO date of fields (clamped into the month and year). */
    fromFields(fields: CalendarFieldsInput): PlainDate;
    /** How many eras the system has (era segments are editable when more than one). */
    eraCount(): number;
    /** The arithmetic year of an era's year. */
    yearOfEra(era: number, eraYear: number): number;
    /** An era's name from `Intl` (`era: "short"`). */
    eraName(locale: string, era: number): string;
    monthsInYear(year: number): number;
    daysInMonth(year: number, month: number): number;
    /**
     * A year whose months are the longest the system has (a leap year), for a month or day
     * typed before its year.
     */
    referenceYear(): number;
    startOfMonth(date: PlainDate): PlainDate;
    endOfMonth(date: PlainDate): PlainDate;
    /** The same day `months` later, clamped to the target month's last day. */
    addMonths(date: PlainDate, months: number): PlainDate;
    /** The same month and day `years` later (a leap month to its common year's month), clamped. */
    addYears(date: PlainDate, years: number): PlainDate;
    /** The difference in whole months from `a`'s month to `b`'s month. */
    monthsBetween(a: PlainDate, b: PlainDate): number;
    isSameMonth(a: PlainDate, b: PlainDate): boolean;
    /** The 6 weeks shown for the month holding `date`, from the locale's first day. */
    monthGrid(date: PlainDate, firstDayOfWeek: number): PlainDate[][];
    /** `calendarKeyTarget` (`/date`) in this system: Page Up and Down move by its months and years. */
    keyTarget(
        key: string,
        focused: PlainDate,
        options: CalendarKeyOptions,
    ): PlainDate | null;
    /** A month as one number (its months counted from the system's year 0): `+ 1` is the next. */
    monthIndex(month: CalendarYearMonth): number;
    fromMonthIndex(index: number): CalendarYearMonth;
    /** The ISO date of a month's first day. */
    monthStart(month: CalendarYearMonth): PlainDate;
    /** The month of an ISO date. */
    yearMonthOf(date: PlainDate): CalendarYearMonth;
    /** An ISO date written by `Intl` in this system (`timeZone: "UTC"`: no host zone moves it). */
    format(
        locale: string,
        date: PlainDate,
        options: Intl.DateTimeFormatOptions,
    ): string;
    /**
     * `Intl.DateTimeFormat#formatRange` of two ISO dates in this system, every space written as
     * U+0020 (engines differ on the spaces around the dash: the `/month-year` year span's rule).
     */
    formatRange(
        locale: string,
        start: PlainDate,
        end: PlainDate,
        options: Intl.DateTimeFormatOptions,
    ): string;
    /** The items of a month or year calendar in this system (cached per kind). */
    units(kind: "month" | "year"): CalendarUnits;
}

/** The longest-months year near the system's year of 2000-01-01, searched over a 19-year cycle. */
function longestYear(engine: CalendarEngine): number {
    const base = engine.fields(
        toEpochDay({ year: 2000, month: 1, day: 1 }),
    ).year;
    let best = base;
    let bestDays = -1;
    for (let year = base; year < base + 19; year++) {
        const days =
            engine.monthStart(year + 1, 1) - engine.monthStart(year, 1);
        if (days > bestDays) {
            best = year;
            bestDays = days;
        }
    }
    return best;
}

/** The system's object over an engine: the generic math every component calls. */
export function createCalendarSystem(engine: CalendarEngine): CalendarSystem {
    const { id } = engine;
    let reference: number | undefined;
    const units: Partial<Record<"month" | "year", CalendarUnits>> = {};
    const monthsInYear = (year: number) => engine.monthsInYear(year);
    const daysInMonth = (year: number, month: number) => {
        const next =
            month >= monthsInYear(year)
                ? engine.monthStart(year + 1, 1)
                : engine.monthStart(year, month + 1);
        return next - engine.monthStart(year, month);
    };
    const fields = (date: PlainDate) => engine.fields(toEpochDay(date));
    const fromFields = (input: CalendarFieldsInput): PlainDate => {
        const year =
            input.era !== undefined && input.eraYear !== undefined
                ? engine.yearOfEra(input.era, input.eraYear)
                : (input.year ?? 1);
        const month = Math.min(Math.max(1, input.month), monthsInYear(year));
        const day = Math.min(Math.max(1, input.day), daysInMonth(year, month));
        return fromEpochDay(engine.monthStart(year, month) + day - 1);
    };
    const monthIndex = (month: CalendarYearMonth) =>
        engine.monthsBefore(month.year) + month.month - 1;
    const fromMonthIndex = (index: number): CalendarYearMonth => {
        // a first guess from 12 months a year, then the year whose months hold the index
        let year = Math.floor(index / 12);
        while (engine.monthsBefore(year) > index) {
            year--;
        }
        while (engine.monthsBefore(year + 1) <= index) {
            year++;
        }
        return { year, month: index - engine.monthsBefore(year) + 1 };
    };
    const yearMonthOf = (date: PlainDate): CalendarYearMonth => {
        const { year, month } = fields(date);
        return { year, month };
    };
    const addMonths = (date: PlainDate, months: number): PlainDate => {
        const { day } = fields(date);
        const target = fromMonthIndex(monthIndex(yearMonthOf(date)) + months);
        return fromFields({ ...target, day });
    };
    const addYears = (date: PlainDate, years: number): PlainDate => {
        const { year, month, day } = fields(date);
        const leap = engine.leapMonth;
        let target = month;
        if (leap > 0) {
            // the month's code (Temporal's): a leap year's leap month is `leap - 0.5` (Adar I,
            // M05L), the months after it shift back by one
            const code =
                monthsInYear(year) > 12 && month >= leap
                    ? month === leap
                        ? leap - 0.5
                        : month - 1
                    : month;
            // in a common year the leap month becomes the month after it (Adar), as Temporal's
            // `constrain` does
            target =
                monthsInYear(year + years) > 12
                    ? code === leap - 0.5
                        ? leap
                        : code >= leap
                          ? code + 1
                          : code
                    : Math.ceil(code);
        }
        return fromFields({ year: year + years, month: target, day });
    };
    const formatter = (locale: string, options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat(system.locale(locale), {
            ...options,
            timeZone: "UTC",
        });
    const startOfMonth = (date: PlainDate) =>
        fromFields({ ...yearMonthOf(date), day: 1 });
    const system: CalendarSystem = {
        id,
        locale: (locale) =>
            new Intl.Locale(locale, { calendar: id }).toString(),
        fields,
        fromFields,
        eraCount: () => engine.eraCount(),
        yearOfEra: (era, eraYear) => engine.yearOfEra(era, eraYear),
        eraName: (locale, era) =>
            formatter(locale, { era: "short", year: "numeric" })
                .formatToParts(utcMidnight(fromEpochDay(engine.eraSample(era))))
                .find((part) => part.type === "era")?.value ?? "",
        monthsInYear,
        daysInMonth,
        referenceYear: () => {
            reference ??= longestYear(engine);
            return reference;
        },
        startOfMonth,
        endOfMonth: (date) => {
            const month = yearMonthOf(date);
            return fromFields({
                ...month,
                day: daysInMonth(month.year, month.month),
            });
        },
        addMonths,
        addYears,
        monthsBetween: (a, b) =>
            monthIndex(yearMonthOf(b)) - monthIndex(yearMonthOf(a)),
        isSameMonth: (a, b) =>
            monthIndex(yearMonthOf(a)) === monthIndex(yearMonthOf(b)),
        monthGrid: (date, firstDayOfWeek) => {
            let cursor = startOfWeek(startOfMonth(date), firstDayOfWeek);
            return Array.from({ length: 6 }, () =>
                Array.from({ length: 7 }, () => {
                    const day = cursor;
                    cursor = addDays(cursor, 1);
                    return day;
                }),
            );
        },
        keyTarget: (key, focused, { rtl, firstDayOfWeek, shiftKey }) => {
            switch (key) {
                case "ArrowRight":
                    return addDays(focused, rtl ? -1 : 1);
                case "ArrowLeft":
                    return addDays(focused, rtl ? 1 : -1);
                case "ArrowDown":
                    return addDays(focused, 7);
                case "ArrowUp":
                    return addDays(focused, -7);
                case "Home":
                    return startOfWeek(focused, firstDayOfWeek);
                case "End":
                    return addDays(startOfWeek(focused, firstDayOfWeek), 6);
                case "PageDown":
                    return shiftKey
                        ? addYears(focused, 1)
                        : addMonths(focused, 1);
                case "PageUp":
                    return shiftKey
                        ? addYears(focused, -1)
                        : addMonths(focused, -1);
                default:
                    return null;
            }
        },
        monthIndex,
        fromMonthIndex,
        monthStart: (month) => fromFields({ ...month, day: 1 }),
        yearMonthOf,
        format: (locale, date, options) =>
            formatter(locale, options).format(utcMidnight(date)),
        formatRange: (locale, start, end, options) =>
            formatter(locale, options)
                .formatRange(utcMidnight(start), utcMidnight(end))
                .replace(/[\u00a0\u2009\u202f]/g, " "),
        units: (kind) => {
            units[kind] ??=
                kind === "month" ? monthUnits(system) : yearUnits(system);
            return units[kind];
        },
    };
    return system;
}
