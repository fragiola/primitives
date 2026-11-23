import { fromEpochDay, toEpochDay, utcMidnight } from "./epoch-day.ts";
import type { IsoEra } from "./iso-engine.ts";

/** The first ISO year whose eras the japanese system computes: Meiji (spec/calendar-systems.md). */
const FIRST_YEAR = 1868;
/** The last ISO year scanned for an era change. */
const LAST_YEAR = 2200;

let cache: readonly IsoEra[] | undefined;

/**
 * The Japanese eras from Meiji on, with their first days, read from `Intl` (`era` of the
 * `japanese` calendar): each year's last day is compared with the previous year's, and a change
 * is searched day by day by halves. Computed once, on first use.
 */
export function japaneseEras(): readonly IsoEra[] {
    if (cache !== undefined) {
        return cache;
    }
    const format = new Intl.DateTimeFormat("en-u-ca-japanese", {
        era: "short",
        timeZone: "UTC",
    });
    const eraOf = (day: number) =>
        format
            .formatToParts(utcMidnight(fromEpochDay(day)))
            .find((part) => part.type === "era")?.value ?? "";
    const eras: IsoEra[] = [];
    let previous = toEpochDay({ year: FIRST_YEAR - 1, month: 12, day: 31 });
    let previousEra = eraOf(previous);
    for (let year = FIRST_YEAR; year <= LAST_YEAR; year++) {
        const last = toEpochDay({ year, month: 12, day: 31 });
        const era = eraOf(last);
        if (era !== previousEra) {
            // the first day of `era` in (previous, last]
            let low = previous;
            let high = last;
            while (high - low > 1) {
                const middle = Math.floor((low + high) / 2);
                if (eraOf(middle) === era) {
                    high = middle;
                } else {
                    low = middle;
                }
            }
            eras.push({ start: high, year: fromEpochDay(high).year });
            previousEra = era;
        }
        previous = last;
    }
    cache = eras;
    return eras;
}
