import { describe, expect, it } from "vitest";
import {
    unitKeyTarget,
    unitPageStart,
    unitRows,
} from "../../src/month-year/unit-grid.ts";

const NOVEMBER_2026 = 2026 * 12 + 10;

describe("unitPageStart", () => {
    it("starts a month's page at January and a year's at a multiple of 12", () => {
        expect(unitPageStart(NOVEMBER_2026)).toBe(2026 * 12);
        expect(unitPageStart(2026)).toBe(2016);
        expect(unitPageStart(2016)).toBe(2016);
        expect(unitPageStart(2015)).toBe(2004);
    });
});

describe("unitRows", () => {
    it("splits a page of 12 items into rows of columns", () => {
        expect(unitRows(2016, 3)).toEqual([
            [2016, 2017, 2018],
            [2019, 2020, 2021],
            [2022, 2023, 2024],
            [2025, 2026, 2027],
        ]);
        expect(unitRows(2016, 4)).toHaveLength(3);
        expect(unitRows(2016, 5).map((row) => row.length)).toEqual([5, 5, 2]);
    });
});

describe("unitKeyTarget", () => {
    const options = { rtl: false, columns: 3 };
    it("moves by one item, a row, a row's ends and a page", () => {
        expect(unitKeyTarget("ArrowRight", 2026, options)).toBe(2027);
        expect(unitKeyTarget("ArrowLeft", 2026, options)).toBe(2025);
        expect(unitKeyTarget("ArrowDown", 2026, options)).toBe(2029);
        expect(unitKeyTarget("ArrowUp", 2026, options)).toBe(2023);
        expect(unitKeyTarget("Home", 2026, options)).toBe(2025);
        expect(unitKeyTarget("End", 2026, options)).toBe(2027);
        expect(unitKeyTarget("PageDown", 2026, options)).toBe(2038);
        expect(unitKeyTarget("PageUp", 2026, options)).toBe(2014);
        expect(unitKeyTarget("Enter", 2026, options)).toBeNull();
    });

    it("maps the months the same way (November's row is October to December)", () => {
        expect(unitKeyTarget("Home", NOVEMBER_2026, options)).toBe(
            NOVEMBER_2026 - 1,
        );
        expect(unitKeyTarget("End", NOVEMBER_2026, options)).toBe(
            NOVEMBER_2026 + 1,
        );
        expect(unitKeyTarget("PageDown", NOVEMBER_2026, options)).toBe(
            NOVEMBER_2026 + 12,
        );
    });

    it("swaps the arrows right to left, and ends a short last row at the page", () => {
        expect(
            unitKeyTarget("ArrowRight", 2026, { rtl: true, columns: 3 }),
        ).toBe(2025);
        expect(unitKeyTarget("End", 2026, { rtl: false, columns: 5 })).toBe(
            2027,
        );
    });
});
