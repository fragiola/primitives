import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// year-range-picker: a list of films filtered by a range of years (spec/month-calendar.md). Today
// is fixed at 2026-11-20. A YearRangePicker (`max` this year, en-US): a trigger "Years: all" (or
// "Years: <start> – <end>"), a popup "Choose years" with a YearRangeCalendar, a "Clear" button and
// the list "Films" (eight films, 1927 to 2023).

const TODAY = new Date(2026, 10, 20, 10, 0, 0);

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(TODAY);
});

test("two years filter the list; Clear shows every film again", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "year-range-picker" });
    const films = frame
        .getByRole("list", { name: "Films" })
        .getByRole("listitem");
    await expect(films).toHaveCount(8);
    await frame.getByRole("button", { name: "Years: all" }).click();
    await expect(
        frame.getByRole("dialog", { name: "Choose years" }),
    ).toBeVisible();
    // the page holding this year, 2016 to 2027; the years after it are disabled
    await expect(
        frame.getByRole("gridcell", { name: "2027", exact: true }),
    ).toHaveAttribute("aria-disabled", "true");
    await frame.getByRole("gridcell", { name: "2023", exact: true }).click();
    await frame.getByRole("gridcell", { name: "2019", exact: true }).click();
    await expect(frame.getByRole("dialog")).toHaveCount(0);
    await expect(
        frame.getByRole("button", { name: "Years: 2019 – 2023" }),
    ).toBeFocused();
    await expect(films).toHaveCount(2);
    await expect(films.first()).toContainText("Parasite");

    // an earlier page: the years 1992 to 2003
    await frame.getByRole("button", { name: "Years: 2019 – 2023" }).click();
    await frame.getByRole("button", { name: "Previous years" }).click();
    await frame.getByRole("button", { name: "Previous years" }).click();
    await frame.getByRole("gridcell", { name: "1992", exact: true }).click();
    await frame.getByRole("gridcell", { name: "2003", exact: true }).click();
    await expect(films).toHaveCount(1);
    await expect(films.first()).toContainText("Spirited Away");

    await frame.getByRole("button", { name: "Clear" }).click();
    await expect(films).toHaveCount(8);
    expect(errors).toEqual([]);
});

test("axe finds no violation, open", async ({ page }) => {
    requireExamples("year-range-picker");
    await page.goto(`${EMBED_BASE}?id=year-range-picker`);
    await page.getByRole("button", { name: "Years: all" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
