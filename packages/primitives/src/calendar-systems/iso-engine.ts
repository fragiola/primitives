import type {
    CalendarDateFields,
    CalendarEngine,
    CalendarId,
} from "./calendar-system.ts";
import { fromEpochDay, toEpochDay } from "./epoch-day.ts";

/**
 * The eras of an ISO-based system: each era's first day (days from 1970-01-01) and its first
 * arithmetic year, oldest first.
 */
export interface IsoEra {
    readonly start: number;
    readonly year: number;
}

/**
 * A system with the ISO calendar's months and days (gregory, buddhist, roc, japanese): its year is
 * the ISO year shifted by `offset`, and `eras` splits it (spec/calendar-systems.md, "Systems").
 * With `before` (gregory, roc), the years before the first era count down in an era of their own
 * (1 BC is the year 0).
 */
export function isoEngine(
    id: CalendarId,
    offset: number,
    eras: () => readonly IsoEra[],
    before: boolean,
): CalendarEngine {
    const all = () =>
        before
            ? [{ start: Number.NEGATIVE_INFINITY, year: 0 }, ...eras()]
            : eras();
    return {
        id,
        leapMonth: 0,
        fields: (epochDay): CalendarDateFields => {
            const iso = fromEpochDay(epochDay);
            const year = iso.year + offset;
            const list = all();
            let era = 0;
            for (let index = 1; index < list.length; index++) {
                if ((list[index] as IsoEra).start <= epochDay) {
                    era = index;
                }
            }
            const first = (list[era] as IsoEra).year;
            return {
                era,
                // the era before the first counts down: its last year is 1
                eraYear: before && era === 0 ? 1 - year : year - first + 1,
                year,
                month: iso.month,
                day: iso.day,
            };
        },
        monthStart: (year, month) =>
            toEpochDay({ year: year - offset, month, day: 1 }),
        monthsInYear: () => 12,
        monthsBefore: (year) => year * 12,
        eraCount: () => all().length,
        yearOfEra: (era, eraYear) => {
            const list = all();
            const index = Math.min(Math.max(0, era), list.length - 1);
            return before && index === 0
                ? 1 - eraYear
                : (list[index] as IsoEra).year + eraYear - 1;
        },
        eraSample: (era) => {
            const list = all();
            const index = Math.min(Math.max(0, era), list.length - 1);
            if (before && index === 0) {
                return toEpochDay({ year: -offset, month: 6, day: 1 });
            }
            const { start } = list[index] as IsoEra;
            // a single era with no start (buddhist): any day names it
            return Number.isFinite(start)
                ? start
                : toEpochDay({ year: 2000, month: 1, day: 1 });
        },
    };
}
