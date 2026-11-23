import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { yearName, yearSpan } from "../../src/dates.ts";
import { expectFocusWithin } from "../../src/focus.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/month-calendar.md: today is fixed at 2026-11-20; en-US. A page holds 12 years from a
// multiple of 12, its grid named by its span

const year = (page: Page, value: number) =>
    page.getByRole("gridcell", { name: yearName("en-US", value), exact: true });
const grid = (page: Page, first: number) =>
    page.getByRole("grid", {
        name: yearSpan("en-US", first, first + 11),
        exact: true,
    });

test.describe("year-calendar / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/year-calendar/basic", { today: true });
    });

    test("a page of 12 years, the keys and the bounds", async ({ page }) => {
        await expect(grid(page, 2016)).toBeVisible();
        await expect(page.getByRole("gridcell")).toHaveCount(12);
        await expect(page.getByRole("gridcell").first()).toHaveAccessibleName(
            yearName("en-US", 2016),
        );
        await expect(year(page, 2026)).toHaveAttribute("aria-current", "date");
        await expect(year(page, 2026)).toHaveAttribute("tabindex", "0");

        await page.getByRole("button", { name: "Next years" }).focus();
        await page.keyboard.press("Tab");
        await expectFocusWithin(year(page, 2026));
        await page.keyboard.press("ArrowDown");
        await expectFocusWithin(year(page, 2029));
        await expect(grid(page, 2028)).toBeVisible();
        await page.keyboard.press("ArrowUp");
        await expectFocusWithin(year(page, 2026));
        await expect(grid(page, 2016)).toBeVisible();
        await page.keyboard.press("Home");
        await expectFocusWithin(year(page, 2025));
        await page.keyboard.press("End");
        await expectFocusWithin(year(page, 2027));
        await page.keyboard.press("PageUp");
        await expectFocusWithin(year(page, 2015));
        await expect(grid(page, 2004)).toBeVisible();
        await page.keyboard.press("PageDown");
        await expectFocusWithin(year(page, 2027));
        // 2039 is after max: the key does nothing
        await page.keyboard.press("PageDown");
        await expectFocusWithin(year(page, 2027));
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "2027");

        const previous = page.getByRole("button", { name: "Previous years" });
        await previous.click();
        await expect(grid(page, 2004)).toBeVisible();
        await expect(year(page, 2009)).toHaveAttribute("aria-disabled", "true");
        await expect(year(page, 2010)).not.toHaveAttribute(
            "aria-disabled",
            "true",
        );
        await expect(previous).toBeDisabled();
        await year(page, 2012).click();
        await expectOutput(page, "value", "2012");
    });

    test("axe finds no violation", async ({ page }) => {
        await year(page, 2020).click();
        await expectNoAxeViolations(page);
    });
});

test.describe("year-calendar / range", () => {
    test("two choices make a range, swapped", async ({ page }) => {
        await openScenario(page, "/year-calendar/range", { today: true });
        await expect(grid(page, 2016)).toHaveAttribute(
            "aria-multiselectable",
            "true",
        );
        await year(page, 2024).click();
        await year(page, 2020).click();
        await expectOutput(page, "value", "2020..2024");
        for (const value of [2020, 2022, 2024]) {
            await expect(year(page, value)).toHaveAttribute(
                "aria-selected",
                "true",
            );
        }
    });
});
