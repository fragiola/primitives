import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { longMonth, monthHeading, yearName } from "../../src/dates.ts";
import { expectFocusWithin } from "../../src/focus.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/month-calendar.md: today is fixed at 2026-11-20; every scenario is en-US. A month cell is
// named by its long month and year ("November 2026"), a month grid by its year

const month = (page: Page, year: number, value: number) =>
    page.getByRole("gridcell", {
        name: monthHeading("en-US", year, value),
        exact: true,
    });
const grid = (page: Page, year: number) =>
    page.getByRole("grid", { name: yearName("en-US", year), exact: true });

/** Puts focus on the grid's focused month, the way a keyboard user enters it. */
async function tabIntoGrid(page: Page) {
    await page.getByRole("button", { name: "Next year" }).focus();
    await page.keyboard.press("Tab");
}

test.describe("month-calendar / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/month-calendar/basic", { today: true });
    });

    test("a grid of the year's months, named by the year", async ({ page }) => {
        await expect(grid(page, 2026)).toBeVisible();
        await expect(grid(page, 2026).getByRole("row")).toHaveCount(4);
        await expect(page.getByRole("gridcell")).toHaveCount(12);
        await expect(page.getByRole("gridcell").first()).toHaveAccessibleName(
            monthHeading("en-US", 2026, 1),
        );
        await expect(page.getByRole("gridcell").first()).toHaveText(
            longMonth("en-US", 2026, 1),
        );
        await expect(month(page, 2026, 11)).toHaveAttribute(
            "aria-current",
            "date",
        );
        await expect(month(page, 2026, 11)).toHaveAttribute("tabindex", "0");
        await expect(month(page, 2026, 10)).toHaveAttribute("tabindex", "-1");
    });

    test("the calendar's keys, mapped to the months", async ({ page }) => {
        await tabIntoGrid(page);
        await expectFocusWithin(month(page, 2026, 11));
        await page.keyboard.press("ArrowRight");
        await expectFocusWithin(month(page, 2026, 12));
        await page.keyboard.press("ArrowRight");
        await expectFocusWithin(month(page, 2027, 1));
        await expect(grid(page, 2027)).toBeVisible();
        await page.keyboard.press("ArrowLeft");
        await expectFocusWithin(month(page, 2026, 12));
        await expect(grid(page, 2026)).toBeVisible();
        await page.keyboard.press("ArrowUp");
        await expectFocusWithin(month(page, 2026, 9));
        await page.keyboard.press("ArrowDown");
        await expectFocusWithin(month(page, 2026, 12));
        await page.keyboard.press("Home");
        await expectFocusWithin(month(page, 2026, 10));
        await page.keyboard.press("End");
        await expectFocusWithin(month(page, 2026, 12));
        await page.keyboard.press("PageUp");
        await expectFocusWithin(month(page, 2025, 12));
        await expect(grid(page, 2025)).toBeVisible();
        await page.keyboard.press("PageDown");
        await expectFocusWithin(month(page, 2026, 12));

        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "2026-12");
        await expect(month(page, 2026, 12)).toHaveAttribute(
            "aria-selected",
            "true",
        );

        // an unavailable month takes the focus, not a choice
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("ArrowLeft");
        await expectFocusWithin(month(page, 2026, 8));
        await expect(month(page, 2026, 8)).toHaveAttribute(
            "aria-disabled",
            "true",
        );
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "2026-12");
    });

    test("min and max disable months and pages", async ({ page }) => {
        const previous = page.getByRole("button", { name: "Previous year" });
        const next = page.getByRole("button", { name: "Next year" });
        await previous.click();
        await expect(grid(page, 2025)).toBeVisible();
        await expect(month(page, 2025, 1)).toHaveAttribute(
            "aria-disabled",
            "true",
        );
        await expect(month(page, 2025, 2)).toHaveAttribute(
            "aria-disabled",
            "true",
        );
        await expect(month(page, 2025, 3)).not.toHaveAttribute(
            "aria-disabled",
            "true",
        );
        await expect(previous).toBeDisabled();
        await next.click();
        await next.click();
        await expect(grid(page, 2027)).toBeVisible();
        await expect(month(page, 2027, 11)).toHaveAttribute(
            "aria-disabled",
            "true",
        );
        await expect(month(page, 2027, 12)).toHaveAttribute(
            "aria-disabled",
            "true",
        );
        await expect(next).toBeDisabled();
        await month(page, 2027, 6).click();
        await expectOutput(page, "value", "2027-06");
    });

    test("axe finds no violation", async ({ page }) => {
        await month(page, 2026, 3).click();
        await expectNoAxeViolations(page);
    });
});

test.describe("month-calendar / range", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/month-calendar/range", { today: true });
    });

    test("two choices make a range, swapped when the end comes first", async ({
        page,
    }) => {
        await expect(grid(page, 2026)).toHaveAttribute(
            "aria-multiselectable",
            "true",
        );
        await month(page, 2026, 3).click();
        await month(page, 2026, 6).click();
        await expectOutput(page, "value", "2026-03..2026-06");
        for (const value of [3, 4, 5, 6]) {
            await expect(month(page, 2026, value)).toHaveAttribute(
                "aria-selected",
                "true",
            );
        }
        await month(page, 2026, 9).click();
        await month(page, 2026, 2).click();
        await expectOutput(page, "value", "2026-02..2026-09");
    });

    test("the keyboard chooses a range, Escape cancels a started one", async ({
        page,
    }) => {
        await month(page, 2026, 9).click();
        await month(page, 2026, 2).click();
        await expectFocusWithin(month(page, 2026, 2));
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Enter");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "2026-03..2026-06");
        await page.keyboard.press("Enter");
        await page.keyboard.press("Escape");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Enter");
        // the range started on June was cancelled: July starts a new one
        await expectOutput(page, "value", "2026-03..2026-06");
    });
});
