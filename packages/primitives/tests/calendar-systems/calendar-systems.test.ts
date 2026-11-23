import { describe, expect, it } from "vitest";
import type { CalendarSystem } from "../../src/calendar-systems/calendar-system.ts";
import {
    buddhist,
    coptic,
    ethioaa,
    ethiopic,
    gregory,
    hebrew,
    indian,
    islamicCivil,
    islamicTbla,
    islamicUmalqura,
    japanese,
    persian,
    roc,
} from "../../src/calendar-systems/systems.ts";
import type { PlainDate } from "../../src/date/plain-date.ts";

const SYSTEMS: readonly CalendarSystem[] = [
    gregory,
    buddhist,
    japanese,
    roc,
    persian,
    indian,
    islamicCivil,
    islamicTbla,
    islamicUmalqura,
    hebrew,
    coptic,
    ethiopic,
    ethioaa,
];

const iso = (year: number, month: number, day: number): PlainDate => ({
    year,
    month,
    day,
});

/** The ISO date `days` after `start`. */
function plus(start: PlainDate, days: number): PlainDate {
    const date = new Date(0);
    date.setUTCFullYear(start.year, start.month - 1, start.day + days);
    return iso(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
    );
}

/** What `Intl` writes for a date in a system (`en`, Latin digits), part by part. */
function intlParts(id: string, date: PlainDate): Record<string, string> {
    const utc = new Date(0);
    utc.setUTCFullYear(date.year, date.month - 1, date.day);
    const parts = new Intl.DateTimeFormat(`en-u-ca-${id}-nu-latn`, {
        era: "short",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        timeZone: "UTC",
    }).formatToParts(utc);
    return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

describe("the calendar systems", () => {
    it("are the 13 systems of the catalog, each known to the engine's Intl", () => {
        expect(SYSTEMS.map((system) => system.id)).toEqual([
            "gregory",
            "buddhist",
            "japanese",
            "roc",
            "persian",
            "indian",
            "islamic-civil",
            "islamic-tbla",
            "islamic-umalqura",
            "hebrew",
            "coptic",
            "ethiopic",
            "ethioaa",
        ]);
        for (const system of SYSTEMS) {
            // an engine lacking a system would resolve another calendar (spec: recorded limits)
            expect(
                new Intl.DateTimeFormat(system.locale("en")).resolvedOptions()
                    .calendar,
            ).toBe(system.id);
        }
    });

    it.each(SYSTEMS.map((system) => [system.id, system] as const))(
        "%s: every day from 1900 to 2100 round-trips through its fields, as Intl writes them",
        (id, system) => {
            const failures: string[] = [];
            const same = (a: PlainDate, b: PlainDate) =>
                a.year === b.year && a.month === b.month && a.day === b.day;
            let previous = system.fields(iso(1899, 12, 31));
            for (let offset = 0; offset < 73_415; offset++) {
                const date = plus(iso(1900, 1, 1), offset);
                const fields = system.fields(date);
                if (
                    !same(system.fromFields(fields), date) ||
                    !same(
                        system.fromFields({
                            era: fields.era,
                            eraYear: fields.eraYear,
                            month: fields.month,
                            day: fields.day,
                        }),
                        date,
                    )
                ) {
                    failures.push(`round trip ${JSON.stringify(date)}`);
                }
                // the day after the previous one: the next day of the month, or a day 1
                const next =
                    fields.day === 1
                        ? fields.month === 1
                            ? fields.year === previous.year + 1
                            : fields.month === previous.month + 1 &&
                              fields.year === previous.year
                        : fields.day === previous.day + 1 &&
                          fields.month === previous.month;
                if (!next) {
                    failures.push(`sequence ${JSON.stringify(date)}`);
                }
                if (offset % 97 === 0) {
                    const parts = intlParts(id, date);
                    if (
                        Number(parts.day) !== fields.day ||
                        Number(parts.year) !== fields.eraYear ||
                        (id !== "hebrew" &&
                            Number(parts.month) !== fields.month)
                    ) {
                        failures.push(`Intl ${JSON.stringify(date)}`);
                    }
                }
                previous = fields;
            }
            expect(failures).toEqual([]);
        },
    );

    it.each(SYSTEMS.map((system) => [system.id, system] as const))(
        "%s: months in a year, month lengths and month numbers agree",
        (_id, system) => {
            const start = system.fields(iso(1950, 1, 1)).year;
            for (let year = start; year < start + 60; year++) {
                const months = system.monthsInYear(year);
                expect(
                    system.monthIndex({ year: year + 1, month: 1 }) -
                        system.monthIndex({ year, month: 1 }),
                ).toBe(months);
                for (let month = 1; month <= months; month++) {
                    const first = system.monthStart({ year, month });
                    expect(system.fields(first)).toMatchObject({
                        year,
                        month,
                        day: 1,
                    });
                    const days = system.daysInMonth(year, month);
                    expect(system.fields(plus(first, days - 1))).toMatchObject({
                        year,
                        month,
                        day: days,
                    });
                    expect(
                        system.fromMonthIndex(
                            system.monthIndex({ year, month }),
                        ),
                    ).toEqual({ year, month });
                }
            }
        },
    );

    it("has the Hebrew leap month: Adar I in a leap year, kept or made Adar by a year's move", () => {
        // 5784 (2023–24) is a leap year, 5785 a common one
        expect(hebrew.monthsInYear(5784)).toBe(13);
        expect(hebrew.monthsInYear(5785)).toBe(12);
        const adarI = hebrew.fromFields({ year: 5784, month: 6, day: 10 });
        expect(intlParts("hebrew", adarI).month).toBe("Adar I");
        const adarII = hebrew.fromFields({ year: 5784, month: 7, day: 10 });
        expect(intlParts("hebrew", adarII).month).toBe("Adar II");
        expect(intlParts("hebrew", hebrew.addYears(adarI, 1)).month).toBe(
            "Adar",
        );
        expect(intlParts("hebrew", hebrew.addYears(adarII, 1)).month).toBe(
            "Adar",
        );
        // 5787 is a leap year again: Adar I stays Adar I across leap years
        expect(intlParts("hebrew", hebrew.addYears(adarI, 3)).month).toBe(
            "Adar I",
        );
        const nisan = hebrew.fromFields({ year: 5784, month: 8, day: 1 });
        expect(intlParts("hebrew", hebrew.addYears(nisan, 1)).month).toBe(
            "Nisan",
        );
        expect(hebrew.addMonths(adarI, 1)).toEqual(
            hebrew.fromFields({ year: 5784, month: 7, day: 10 }),
        );
    });

    it("has the Coptic and Ethiopic 13th month of 5 or 6 days", () => {
        for (const system of [coptic, ethiopic, ethioaa]) {
            const year = system.fields(iso(2026, 11, 20)).year;
            expect(system.monthsInYear(year)).toBe(13);
            const days = [0, 1, 2, 3].map((step) =>
                system.daysInMonth(year + step, 13),
            );
            expect(days.every((count) => count === 5 || count === 6)).toBe(
                true,
            );
            expect(days).toContain(6);
        }
    });

    it("moves through the Japanese eras on their first days", () => {
        expect(japanese.eraCount()).toBe(5);
        expect(japanese.fields(iso(2019, 4, 30))).toEqual({
            era: 3,
            eraYear: 31,
            year: 2019,
            month: 4,
            day: 30,
        });
        expect(japanese.fields(iso(2019, 5, 1))).toMatchObject({
            era: 4,
            eraYear: 1,
        });
        expect(japanese.fields(iso(1989, 1, 7))).toMatchObject({
            era: 2,
            eraYear: 64,
        });
        expect(japanese.fields(iso(1989, 1, 8))).toMatchObject({
            era: 3,
            eraYear: 1,
        });
        expect(
            japanese.fromFields({ era: 4, eraYear: 8, month: 11, day: 20 }),
        ).toEqual(iso(2026, 11, 20));
        expect(japanese.eraName("ja-JP", 4)).toBe(
            intlParts("japanese", iso(2026, 1, 1)).era === "Reiwa"
                ? new Intl.DateTimeFormat("ja-JP-u-ca-japanese", {
                      era: "short",
                      year: "numeric",
                      timeZone: "UTC",
                  })
                      .formatToParts(new Date(Date.UTC(2026, 0, 1)))
                      .find((part) => part.type === "era")?.value
                : "",
        );
    });

    it("counts the eras before Minguo and before AD down", () => {
        expect(roc.fields(iso(1911, 6, 1))).toMatchObject({
            era: 0,
            eraYear: 1,
            year: 0,
        });
        expect(roc.fields(iso(1912, 1, 1))).toMatchObject({
            era: 1,
            eraYear: 1,
            year: 1,
        });
        expect(
            roc.fromFields({ era: 0, eraYear: 1, month: 6, day: 1 }),
        ).toEqual(iso(1911, 6, 1));
        expect(gregory.fields(iso(0, 6, 1))).toMatchObject({
            era: 0,
            eraYear: 1,
        });
        expect(gregory.eraName("en-US", 0)).toBe(
            intlParts("gregory", iso(0, 6, 1)).era,
        );
        expect(buddhist.fields(iso(2026, 11, 20))).toMatchObject({
            era: 0,
            eraYear: 2569,
            year: 2569,
        });
    });

    it("clamps a day or month past its end (Temporal's constrain)", () => {
        expect(persian.fromFields({ year: 1404, month: 12, day: 31 })).toEqual(
            persian.fromFields({
                year: 1404,
                month: 12,
                day: persian.daysInMonth(1404, 12),
            }),
        );
        expect(hebrew.fromFields({ year: 5785, month: 13, day: 1 })).toEqual(
            hebrew.fromFields({ year: 5785, month: 12, day: 1 }),
        );
    });

    it("does the calendars' month math in the system", () => {
        // 2026-11-20 is 29 Aban 1405
        const date = iso(2026, 11, 20);
        expect(persian.fields(date)).toMatchObject({
            year: 1405,
            month: 8,
            day: 29,
        });
        expect(persian.startOfMonth(date)).toEqual(iso(2026, 10, 23));
        expect(persian.endOfMonth(date)).toEqual(iso(2026, 11, 21));
        expect(persian.fields(persian.addMonths(date, 1))).toMatchObject({
            year: 1405,
            month: 9,
            day: 29,
        });
        expect(persian.fields(persian.addMonths(date, -8))).toMatchObject({
            year: 1404,
            month: 12,
            day: 29,
        });
        expect(persian.fields(persian.addYears(date, 1))).toMatchObject({
            year: 1406,
            month: 8,
            day: 29,
        });
        expect(persian.monthsBetween(date, persian.addMonths(date, 14))).toBe(
            14,
        );
        expect(persian.isSameMonth(iso(2026, 10, 23), iso(2026, 11, 21))).toBe(
            true,
        );
        expect(persian.isSameMonth(iso(2026, 11, 21), iso(2026, 11, 22))).toBe(
            false,
        );
        const grid = persian.monthGrid(date, 6);
        expect(grid).toHaveLength(6);
        expect(grid[0]).toHaveLength(7);
        // Aban 1405 starts on Friday 2026-10-23: a Saturday-first week starts the day after...
        // so the grid starts the Saturday before, 2026-10-17
        expect(grid[0]?.[0]).toEqual(iso(2026, 10, 17));
        expect(
            persian.keyTarget("PageDown", date, {
                rtl: true,
                firstDayOfWeek: 6,
                shiftKey: false,
            }),
        ).toEqual(persian.addMonths(date, 1));
        expect(
            persian.keyTarget("PageUp", date, {
                rtl: true,
                firstDayOfWeek: 6,
                shiftKey: true,
            }),
        ).toEqual(persian.addYears(date, -1));
        expect(
            persian.keyTarget("ArrowLeft", date, {
                rtl: true,
                firstDayOfWeek: 6,
                shiftKey: false,
            }),
        ).toEqual(iso(2026, 11, 21));
        expect(
            persian.keyTarget("Tab", date, {
                rtl: false,
                firstDayOfWeek: 6,
                shiftKey: false,
            }),
        ).toBeNull();
    });

    it("writes names with Intl in the system, its locale keeping the other extensions", () => {
        expect(persian.locale("fa-IR")).toBe("fa-IR-u-ca-persian");
        expect(persian.locale("fa-IR-u-ca-gregory")).toBe("fa-IR-u-ca-persian");
        expect(islamicUmalqura.locale("ar-SA-u-nu-latn")).toBe(
            "ar-SA-u-ca-islamic-umalqura-nu-latn",
        );
        const date = iso(2026, 11, 20);
        expect(
            persian.format("en", date, { month: "long", year: "numeric" }),
        ).toBe(
            new Intl.DateTimeFormat("en-u-ca-persian", {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
            }).format(new Date(Date.UTC(2026, 10, 20))),
        );
        const span = persian.formatRange(
            "en",
            persian.monthStart({ year: 1404, month: 1 }),
            persian.monthStart({ year: 1415, month: 1 }),
            { year: "numeric" },
        );
        expect(span).toMatch(/1404.*1415/);
        expect(span).not.toMatch(/[   ]/);
    });

    it("has a reference year with the longest months (a leap year)", () => {
        for (const system of SYSTEMS) {
            const year = system.referenceYear();
            const days = (candidate: number) =>
                Array.from(
                    { length: system.monthsInYear(candidate) },
                    (_, month) => system.daysInMonth(candidate, month + 1),
                ).reduce((sum, count) => sum + count, 0);
            for (let other = year - 3; other <= year + 3; other++) {
                expect(days(year)).toBeGreaterThanOrEqual(days(other));
            }
        }
    });
});
