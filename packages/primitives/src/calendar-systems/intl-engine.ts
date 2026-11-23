import type {
    CalendarDateFields,
    CalendarEngine,
    CalendarId,
} from "./calendar-system.ts";
import { fromEpochDay, toEpochDay, utcMidnight } from "./epoch-day.ts";

interface Probe {
    readonly era: string;
    readonly eraYear: number;
    readonly day: number;
}

/**
 * A system computed by `Intl` (spec/calendar-systems.md, "How a system is computed"): ICU does the
 * math, this probes it. A day's year and day of the month come from `formatToParts` in the
 * system (`en`, Latin digits); a month starts on its day 1, a year on its first month; the month
 * starts of each year are found once and cached, so a month's place counts from its year's first
 * month (the Hebrew calendar writes its months by name). `monthsBefore` is the system's rule:
 * 12 months a year, 13 (Coptic, Ethiopic), or the Hebrew 19-year cycle.
 */
export function intlEngine(
    id: CalendarId,
    months: 12 | 13 | "hebrew",
    leapMonth = 0,
): CalendarEngine {
    let format: Intl.DateTimeFormat | undefined;
    const probes = new Map<number, Probe>();
    const starts = new Map<number, number[]>();
    let mainEra: string | undefined;
    let meanYear = 0;
    const reference = toEpochDay({ year: 2000, month: 1, day: 1 });

    const probe = (day: number): Probe => {
        let found = probes.get(day);
        if (found === undefined) {
            format ??= new Intl.DateTimeFormat(`en-u-ca-${id}-nu-latn`, {
                era: "short",
                year: "numeric",
                month: "numeric",
                day: "numeric",
                timeZone: "UTC",
            });
            const parts = format.formatToParts(utcMidnight(fromEpochDay(day)));
            const value = (type: string) =>
                parts.find((part) => part.type === type)?.value ?? "";
            found = {
                era: value("era"),
                eraYear: Number(value("year")),
                day: Number(value("day")),
            };
            probes.set(day, found);
        }
        return found;
    };
    const yearOf = (day: number): number => {
        const { era, eraYear } = probe(day);
        mainEra ??= probe(reference).era;
        if (era === mainEra) {
            return eraYear;
        }
        // before the system's era: Ethiopic counts the Amete Alem (5500 years earlier), the others
        // count down from 1
        return id === "ethiopic" ? eraYear - 5500 : 1 - eraYear;
    };
    const monthStartOf = (day: number) => day - probe(day).day + 1;
    const yearStart = (year: number): number => {
        if (meanYear === 0) {
            meanYear =
                36_524 / (yearOf(reference + 36_524) - yearOf(reference));
        }
        let day = reference + Math.round((year - yearOf(reference)) * meanYear);
        while (yearOf(day) < year) {
            day += 20;
        }
        while (yearOf(day) > year) {
            day -= 20;
        }
        let start = monthStartOf(day);
        while (yearOf(start - 1) === year) {
            start = monthStartOf(start - 1);
        }
        return start;
    };
    const monthStarts = (year: number): number[] => {
        let list = starts.get(year);
        if (list === undefined) {
            list = [];
            // a month is never longer than 32 days, and a month and the next are longer together
            // (the 5-day Coptic and Ethiopic 13th month follows a 30-day one)
            for (
                let start = yearStart(year);
                yearOf(start) === year;
                start = monthStartOf(start + 32)
            ) {
                list.push(start);
            }
            starts.set(year, list);
        }
        return list;
    };
    const monthsBefore = (year: number): number =>
        months === "hebrew"
            ? Math.floor((235 * year - 234) / 19)
            : months * year;
    return {
        id,
        leapMonth,
        fields: (day): CalendarDateFields => {
            const year = yearOf(day);
            const list = monthStarts(year);
            let month = 1;
            while (month < list.length && (list[month] as number) <= day) {
                month++;
            }
            return {
                era: 0,
                eraYear: year,
                year,
                month,
                day: day - (list[month - 1] as number) + 1,
            };
        },
        monthStart: (year, month) => {
            const list = monthStarts(year);
            return list[
                Math.min(Math.max(1, month), list.length) - 1
            ] as number;
        },
        monthsInYear: (year) => monthStarts(year).length,
        monthsBefore,
        eraCount: () => 1,
        yearOfEra: (_era, eraYear) => eraYear,
        eraSample: () => reference,
    };
}
