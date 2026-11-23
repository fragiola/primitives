import { describe, expect, it } from "vitest";
import {
    gregory,
    hebrew,
    persian,
} from "../../src/calendar-systems/systems.ts";

const NOV_20 = { year: 2026, month: 11, day: 20 };

describe("the month and year calendars' items in a calendar system", () => {
    it("pages a system's months by its years: 12, or 13 in a Hebrew leap year", () => {
        const months = persian.units("month");
        const aban = months.fromDate(NOV_20);
        expect(months.item(aban)).toEqual({ year: 1405, month: 8 });
        expect(months.index({ year: 1405, month: 8 })).toBe(aban);
        const start = months.pageStart(aban);
        expect(months.item(start)).toEqual({ year: 1405, month: 1 });
        expect(months.pageSize(start)).toBe(12);
        expect(months.rows(start, 3)).toHaveLength(4);
        const hebrewMonths = hebrew.units("month");
        const leap = hebrewMonths.index({ year: 5787, month: 1 });
        expect(hebrewMonths.pageSize(leap)).toBe(13);
        expect(hebrewMonths.rows(leap, 3).map((row) => row.length)).toEqual([
            3, 3, 3, 3, 1,
        ]);
        // End on the last row stops at the page's end
        expect(
            hebrewMonths.keyTarget("End", leap + 12, {
                rtl: false,
                columns: 3,
            }),
        ).toBe(leap + 12);
        expect(hebrew.units("month")).toBe(hebrewMonths);
    });

    it("moves a page by the same month of the next or previous year", () => {
        const months = persian.units("month");
        const aban = months.fromDate(NOV_20);
        expect(
            months.item(
                months.keyTarget("PageDown", aban, {
                    rtl: false,
                    columns: 3,
                }) ?? 0,
            ),
        ).toEqual({ year: 1406, month: 8 });
        expect(
            months.keyTarget("ArrowLeft", aban, { rtl: true, columns: 3 }),
        ).toBe(aban + 1);
        expect(
            months.keyTarget("Tab", aban, { rtl: false, columns: 3 }),
        ).toBeNull();
        // Adar I (a leap year's 6th month) a year later is Adar (a common year's 6th)
        const hebrewMonths = hebrew.units("month");
        const adarI = hebrewMonths.index({ year: 5784, month: 6 });
        expect(
            hebrewMonths.item(
                hebrewMonths.keyTarget("PageDown", adarI, {
                    rtl: false,
                    columns: 3,
                }) ?? 0,
            ),
        ).toEqual({ year: 5785, month: 6 });
    });

    it("lists a unit's days, names it with Intl and writes its form text", () => {
        const months = persian.units("month");
        const aban = months.fromDate(NOV_20);
        const days = months.days(aban);
        expect(days).toHaveLength(30);
        expect(days[0]).toEqual({ year: 2026, month: 10, day: 23 });
        const intl = (options: Intl.DateTimeFormatOptions) =>
            new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
                ...options,
                timeZone: "UTC",
            }).format(new Date(Date.UTC(2026, 9, 23)));
        expect(months.text("fa-IR", aban)).toBe(intl({ month: "long" }));
        expect(months.name("fa-IR", aban)).toBe(
            intl({ month: "long", year: "numeric" }),
        );
        expect(months.heading("fa-IR", months.pageStart(aban))).toBe(
            new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
                year: "numeric",
                timeZone: "UTC",
            }).format(new Date(Date.UTC(2026, 2, 21))),
        );
        expect(months.iso(aban)).toBe("2026-10-23[u-ca=persian]");
        const years = persian.units("year");
        expect(years.fromDate(NOV_20)).toBe(1405);
        expect(years.pageStart(1405)).toBe(1404);
        expect(years.days(1405)).toHaveLength(365);
        expect(years.iso(1405)).toBe("2026-03-21[u-ca=persian]");
        expect(years.heading("en", 1404)).toMatch(
            /^1404 AP – 1415 AP$|1404.*1415/,
        );
        expect(gregory.units("year").iso(2026)).toBe(
            "2026-01-01[u-ca=gregory]",
        );
    });
});
