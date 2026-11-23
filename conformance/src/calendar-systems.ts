import type { Page } from "@playwright/test";

// spec/calendar-systems.md, "Scenarios": what a calendar system makes of 2026-11-20, computed in
// the browser with its own `Intl` (engines differ in their ICU), never written in a test.

/** The locales of the scenarios, each with its system's `-u-ca-` keyword. */
export const SYSTEM_LOCALES = [
    { locale: "ja-JP-u-ca-japanese", rtl: false },
    { locale: "fa-IR-u-ca-persian", rtl: true },
    { locale: "ar-SA-u-ca-islamic-umalqura", rtl: true },
    { locale: "he-IL-u-ca-hebrew", rtl: true },
    { locale: "th-TH-u-ca-buddhist", rtl: false },
] as const;

/** The scenario's path for a locale (its query as the spec's heading writes it). */
export function systemPath(
    scenario: "basic" | "pickers",
    locale: string,
    rtl: boolean,
): string {
    return `/calendar-systems/${scenario}?locale=${locale}${rtl ? "&dir=rtl" : ""}`;
}

/** What the system makes of 2026-11-20 and the dates around it (ISO text and `Intl` names). */
export interface SystemFacts {
    /** The `Intl` id of the locale's calendar. */
    id: string;
    /** "November 2026" in the system: the day grid's heading (local midnight, no time zone). */
    heading: string;
    /** The full date of 2026-11-20 (a day cell's name). */
    fullDate: string;
    /** The day of the month of 2026-11-20, as the cell reads it. */
    dayText: string;
    /** How many days the system's month of 2026-11-20 has. */
    monthDays: number;
    /** The ISO date of that month's first day. */
    monthStart: string;
    /** The same day of the system's next month (clamped), ISO. */
    nextMonthDay: string;
    /** That date's full name and its month's heading. */
    nextMonthDayName: string;
    nextMonthHeading: string;
    /** The ISO date of the system year's first day (of 2026-11-20). */
    yearStart: string;
    /** The system's year of 2026-11-20 (`Intl`'s `year: "numeric"`, UTC): a month page's heading. */
    yearHeading: string;
    /** The month calendar's cell name of the system month ("Azar 1405") and the next month's. */
    monthName: string;
    /** How many months the system's year of 2026-11-20 has. */
    monthsInYear: number;
    /** `Intl`'s parts of 2026-11-20 in the locale (`year`, `month`, `day`, `era`). */
    parts: Record<string, string>;
    /** The system's fields of 2026-11-20 and of the next month (`year` arithmetic, `month` its place). */
    fields: { year: number; month: number };
    nextFields: { year: number; month: number };
}

/** The facts of the scenarios' locale, read in the page. */
export function systemFacts(page: Page, locale: string): Promise<SystemFacts> {
    return page.evaluate((locale) => {
        const id = new Intl.DateTimeFormat(locale).resolvedOptions().calendar;
        const DAY = 86_400_000;
        const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
        const local = (iso: string) => {
            const [year, month, day] = iso.split("-").map(Number) as [
                number,
                number,
                number,
            ];
            return new Date(year, month - 1, day);
        };
        const isoOf = (date: Date) => date.toISOString().slice(0, 10);
        const plus = (iso: string, days: number) =>
            isoOf(new Date(utc(iso).getTime() + days * DAY));
        // the system's day, month and year of an ISO date, in Latin digits
        const probe = new Intl.DateTimeFormat(`en-u-ca-${id}-nu-latn`, {
            era: "short",
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
        });
        const fieldsOf = (iso: string) => {
            const parts = Object.fromEntries(
                probe
                    .formatToParts(utc(iso))
                    .map((part) => [part.type, part.value]),
            );
            return {
                day: Number(parts.day),
                month: `${parts.month}`,
                year: `${parts.era} ${parts.year}`,
            };
        };
        const start = (iso: string) => plus(iso, 1 - fieldsOf(iso).day);
        const days = (first: string) => {
            let count = 1;
            while (fieldsOf(plus(first, count)).day !== 1) {
                count++;
            }
            return count;
        };
        const today = "2026-11-20";
        const monthStart = start(today);
        const length = days(monthStart);
        const nextStart = plus(monthStart, length);
        const nextLength = days(nextStart);
        const target = Math.min(fieldsOf(today).day, nextLength);
        const nextMonthDay = plus(nextStart, target - 1);
        // the year's first day: back month by month while the year is the same
        let yearStart = monthStart;
        let monthsBefore = 0;
        while (fieldsOf(plus(yearStart, -1)).year === fieldsOf(today).year) {
            yearStart = start(plus(yearStart, -1));
            monthsBefore++;
        }
        let monthsInYear = monthsBefore + 1;
        for (
            let cursor = nextStart;
            fieldsOf(cursor).year === fieldsOf(today).year;
            cursor = plus(cursor, days(cursor))
        ) {
            monthsInYear++;
        }
        // a day cell's name in a system: explicit fields (spec/calendar-systems.md)
        const FULL: Intl.DateTimeFormatOptions = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        const named = (options: Intl.DateTimeFormatOptions, date: Date) =>
            new Intl.DateTimeFormat(locale, options).format(date);
        const utcNamed = (options: Intl.DateTimeFormatOptions, iso: string) =>
            new Intl.DateTimeFormat(locale, {
                ...options,
                timeZone: "UTC",
            }).format(utc(iso));
        const yearNumber = (iso: string) =>
            Number(
                new Intl.DateTimeFormat(`en-u-ca-${id}-nu-latn`, {
                    year: "numeric",
                    timeZone: "UTC",
                })
                    .formatToParts(utc(iso))
                    .find((part) => part.type === "year")?.value,
            );
        return {
            id,
            heading: named({ month: "long", year: "numeric" }, local(today)),
            fullDate: named(FULL, local(today)),
            dayText: named({ day: "numeric" }, local(today)),
            monthDays: length,
            monthStart,
            nextMonthDay,
            nextMonthDayName: named(FULL, local(nextMonthDay)),
            nextMonthHeading: named(
                { month: "long", year: "numeric" },
                local(nextMonthDay),
            ),
            yearStart,
            yearHeading: utcNamed({ year: "numeric" }, yearStart),
            monthName: utcNamed({ month: "long", year: "numeric" }, monthStart),
            monthsInYear,
            parts: Object.fromEntries(
                new Intl.DateTimeFormat(locale, {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    timeZone: "UTC",
                })
                    .formatToParts(utc(today))
                    .filter((part) => part.type !== "literal")
                    .map((part) => [part.type, part.value]),
            ),
            fields: {
                // the arithmetic year: the ISO year for the Japanese calendar (its eras split it)
                year: id === "japanese" ? 2026 : yearNumber(today),
                month: monthsBefore + 1,
            },
            nextFields:
                monthsBefore + 2 > monthsInYear
                    ? {
                          year:
                              (id === "japanese" ? 2026 : yearNumber(today)) +
                              1,
                          month: 1,
                      }
                    : {
                          year: id === "japanese" ? 2026 : yearNumber(today),
                          month: monthsBefore + 2,
                      },
        };
    }, locale);
}
