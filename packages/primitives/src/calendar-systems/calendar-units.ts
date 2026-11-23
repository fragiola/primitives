import type { PlainDate } from "../date/plain-date.ts";
import type { UnitKeyOptions } from "../month-year/unit-grid.ts";
import type { CalendarSystem } from "./calendar-system.ts";
import { fromEpochDay, toEpochDay } from "./epoch-day.ts";

/** A month or a year of a calendar system: `{ year, month }`, or `{ year }`. */
export interface CalendarUnit {
    readonly year: number;
    readonly month?: number;
}

/**
 * The items of a month or year calendar in a calendar system (spec/calendar-systems.md, "Month and
 * year calendars"), as numbers: a month's `monthIndex` (a page is its year: 12 or 13 months), or
 * the year (a page of 12 from a multiple of 12, as the ISO calendar's).
 */
export interface CalendarUnits {
    /** The number of a month or year. */
    index(item: CalendarUnit): number;
    /** The month or year of a number. */
    item(index: number): CalendarUnit;
    /** The first item of the page holding `index`. */
    pageStart(index: number): number;
    /** How many items the page starting at `start` holds. */
    pageSize(start: number): number;
    /** The first item of the next (`1`) or previous (`-1`) page (a year can have 13 months). */
    page(start: number, delta: 1 | -1): number;
    /** Today's month or year (the page's local date). */
    today(): number;
    /** The page starting at `start`, in rows of `columns`. */
    rows(start: number, columns: number): number[][];
    /** The item a key moves to (the ISO calendar's `unitKeyTarget`, a page being a year). */
    keyTarget(
        key: string,
        focused: number,
        options: UnitKeyOptions,
    ): number | null;
    /** The month or year of an ISO date. */
    fromDate(date: PlainDate): number;
    /** The ISO dates of a month or year. */
    days(index: number): PlainDate[];
    /**
     * A CalendarView's choice of a month or year: its enabled day nearest to the focused date's
     * place in it (the same day of the month, the same month and day of the year); `undefined`
     * when every day is disabled.
     */
    nearest(
        index: number,
        focused: PlainDate,
        enabled: (date: PlainDate) => boolean,
    ): PlainDate | undefined;
    /** A month's cell content ("Azar"), a year's ("1405"). */
    text(locale: string, index: number): string;
    /** A cell's name ("Azar 1405", "1405"). */
    name(locale: string, index: number): string;
    /** The page's heading: the year of a month page, the span of a year page ("1395 – 1406"). */
    heading(locale: string, start: number): string;
    /**
     * The form's text: the ISO date of the first day with the system (RFC 9557, Temporal's
     * `toString` of a non-ISO month): `2026-10-23[u-ca=persian]`.
     */
    iso(index: number): string;
}

const pad = (value: number, size: number) =>
    String(Math.abs(value)).padStart(size, "0");

function isoText(date: PlainDate, id: string): string {
    return `${date.year < 0 ? "-" : ""}${pad(date.year, 4)}-${pad(date.month, 2)}-${pad(date.day, 2)}[u-ca=${id}]`;
}

/** Today, in the page's local time. */
function localToday(): PlainDate {
    const now = new Date();
    return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
    };
}

function between(first: PlainDate, next: PlainDate): PlainDate[] {
    const start = toEpochDay(first);
    return Array.from({ length: toEpochDay(next) - start }, (_, offset) =>
        fromEpochDay(start + offset),
    );
}

/** The enabled day of `days` nearest to `place`. */
function nearestDay(
    days: PlainDate[],
    place: PlainDate,
    enabled: (date: PlainDate) => boolean,
): PlainDate | undefined {
    const at = toEpochDay(place);
    const distance = (date: PlainDate) => Math.abs(toEpochDay(date) - at);
    return days.filter(enabled).sort((a, b) => distance(a) - distance(b))[0];
}

/** A year page's size: 12 years from a multiple of 12, as the ISO calendar's (`/month-year`). */
const YEARS = 12;

/** A page of `count` items from `start`, in rows of `columns`. */
function rowsOf(start: number, count: number, columns: number): number[][] {
    const size = Math.max(1, Math.floor(columns));
    const rows: number[][] = [];
    for (let offset = 0; offset < count; offset += size) {
        rows.push(
            Array.from(
                { length: Math.min(size, count - offset) },
                (_, column) => start + offset + column,
            ),
        );
    }
    return rows;
}

/**
 * The item a key moves to on a page (`/month-year`'s `unitKeyTarget`, kept here: this entry
 * imports no other's code), Page Up and Down by `pageMove`.
 */
function pagedKeyTarget(
    key: string,
    focused: number,
    { rtl, columns }: UnitKeyOptions,
    page: number,
    count: number,
    pageMove: (delta: 1 | -1) => number,
): number | null {
    const size = Math.max(1, Math.floor(columns));
    const rowStart = page + Math.floor((focused - page) / size) * size;
    switch (key) {
        case "ArrowRight":
            return focused + (rtl ? -1 : 1);
        case "ArrowLeft":
            return focused + (rtl ? 1 : -1);
        case "ArrowDown":
            return focused + size;
        case "ArrowUp":
            return focused - size;
        case "Home":
            return rowStart;
        case "End":
            return Math.min(rowStart + size, page + count) - 1;
        case "PageDown":
            return pageMove(1);
        case "PageUp":
            return pageMove(-1);
        default:
            return null;
    }
}

/** The months of a system, a page being one of its years. */
export function monthUnits(system: CalendarSystem): CalendarUnits {
    const yearStart = (index: number) =>
        system.monthIndex({
            year: system.fromMonthIndex(index).year,
            month: 1,
        });
    const pageSize = (start: number) =>
        system.monthsInYear(system.fromMonthIndex(start).year);
    const first = (index: number) =>
        system.monthStart(system.fromMonthIndex(index));
    const fromDate = (date: PlainDate) =>
        system.monthIndex(system.yearMonthOf(date));
    return {
        index: (item) =>
            system.monthIndex({ year: item.year, month: item.month ?? 1 }),
        item: (index) => system.fromMonthIndex(index),
        pageStart: yearStart,
        pageSize,
        page: (start, delta) =>
            delta > 0 ? start + pageSize(start) : yearStart(start - 1),
        today: () => fromDate(localToday()),
        rows: (start, columns) => rowsOf(start, pageSize(start), columns),
        keyTarget: (key, focused, options) => {
            const page = yearStart(focused);
            // the same month of the next or previous year (a leap month to its common year's)
            return pagedKeyTarget(
                key,
                focused,
                options,
                page,
                pageSize(page),
                (delta) =>
                    system.monthIndex(
                        system.yearMonthOf(
                            system.addYears(first(focused), delta),
                        ),
                    ),
            );
        },
        fromDate,
        days: (index) => between(first(index), first(index + 1)),
        nearest: (index, focused, enabled) =>
            nearestDay(
                between(first(index), first(index + 1)),
                system.fromFields({
                    ...system.fromMonthIndex(index),
                    day: system.fields(focused).day,
                }),
                enabled,
            ),
        text: (locale, index) =>
            system.format(locale, first(index), { month: "long" }),
        name: (locale, index) =>
            system.format(locale, first(index), {
                month: "long",
                year: "numeric",
            }),
        heading: (locale, start) =>
            system.format(locale, first(start), { year: "numeric" }),
        iso: (index) => isoText(first(index), system.id),
    };
}

/** The years of a system, in pages of 12 from a multiple of 12. */
export function yearUnits(system: CalendarSystem): CalendarUnits {
    const first = (year: number) => system.monthStart({ year, month: 1 });
    const pageStart = (year: number) => Math.floor(year / YEARS) * YEARS;
    const fromDate = (date: PlainDate) => system.fields(date).year;
    return {
        index: (item) => item.year,
        item: (index) => ({ year: index }),
        pageStart,
        pageSize: () => YEARS,
        page: (start, delta) => start + delta * YEARS,
        today: () => fromDate(localToday()),
        rows: (start, columns) => rowsOf(start, YEARS, columns),
        keyTarget: (key, focused, options) =>
            pagedKeyTarget(
                key,
                focused,
                options,
                pageStart(focused),
                YEARS,
                (delta) => focused + delta * YEARS,
            ),
        fromDate,
        days: (year) => between(first(year), first(year + 1)),
        nearest: (year, focused, enabled) =>
            nearestDay(
                between(first(year), first(year + 1)),
                system.addYears(focused, year - system.fields(focused).year),
                enabled,
            ),
        text: (locale, year) =>
            system.format(locale, first(year), { year: "numeric" }),
        name: (locale, year) =>
            system.format(locale, first(year), { year: "numeric" }),
        heading: (locale, start) =>
            system.formatRange(locale, first(start), first(start + YEARS - 1), {
                year: "numeric",
            }),
        iso: (year) => isoText(first(year), system.id),
    };
}
