import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { fullDate, monthHeading, yearName, yearSpan } from "../../src/dates.ts";
import { expectFocusWithin } from "../../src/focus.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";
import { fieldGroup, segment, typeKeys } from "../../src/segments.ts";

// spec/month-calendar.md, "Views": today is fixed at 2026-11-20; en-US

const day = (page: Page, year: number, month: number, value: number) =>
    page.getByRole("gridcell", {
        name: fullDate("en-US", year, month, value),
        exact: true,
    });
const month = (page: Page, year: number, value: number) =>
    page.getByRole("gridcell", {
        name: monthHeading("en-US", year, value),
        exact: true,
    });
const year = (page: Page, value: number) =>
    page.getByRole("gridcell", { name: yearName("en-US", value), exact: true });
const grid = (page: Page, name: string) =>
    page.getByRole("grid", { name, exact: true });
const viewTrigger = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true });

test.describe("calendar-view / picker", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/calendar-view/picker", { today: true });
    });

    test("up through the views and down by choices, the focus in each new grid", async ({
        page,
    }) => {
        const trigger = page.getByRole("button", { name: /^Choose date: / });
        await trigger.click();
        await expectFocusWithin(day(page, 2026, 11, 20));
        await expect(grid(page, monthHeading("en-US", 2026, 11))).toBeVisible();

        // the Trigger goes up: the month grid's focused month takes the focus
        await viewTrigger(page, monthHeading("en-US", 2026, 11)).click();
        await expect(grid(page, yearName("en-US", 2026))).toBeVisible();
        await expectFocusWithin(month(page, 2026, 11));

        // a month goes down to its days, the same day focused; the value unchanged
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("Enter");
        await expect(grid(page, monthHeading("en-US", 2026, 8))).toBeVisible();
        await expectFocusWithin(day(page, 2026, 8, 20));
        await expectOutput(page, "value", "none");

        // up twice: the years, bounded by the days' min
        await viewTrigger(page, monthHeading("en-US", 2026, 8)).click();
        await viewTrigger(page, yearName("en-US", 2026)).click();
        await expect(grid(page, yearSpan("en-US", 2016, 2027))).toBeVisible();
        await expectFocusWithin(year(page, 2026));
        await expect(year(page, 2024)).toHaveAttribute("aria-disabled", "true");
        await expect(year(page, 2025)).not.toHaveAttribute(
            "aria-disabled",
            "true",
        );

        // a year goes down to its months, a month to its days; a day is chosen
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Enter");
        await expect(grid(page, yearName("en-US", 2027))).toBeVisible();
        await expectFocusWithin(month(page, 2027, 8));
        await page.keyboard.press("Enter");
        await expect(grid(page, monthHeading("en-US", 2027, 8))).toBeVisible();
        await expectFocusWithin(day(page, 2027, 8, 20));
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "2027-08-20");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(trigger).toBeFocused();

        // reopened on the day view and the value
        await trigger.click();
        await expectFocusWithin(day(page, 2027, 8, 20));

        // max disables the months after it
        await viewTrigger(page, monthHeading("en-US", 2027, 8)).click();
        await page.getByRole("button", { name: "Next year" }).click();
        await expect(grid(page, yearName("en-US", 2028))).toBeVisible();
        await expect(month(page, 2028, 3)).toHaveAttribute(
            "aria-disabled",
            "true",
        );
        await expect(month(page, 2028, 2)).not.toHaveAttribute(
            "aria-disabled",
            "true",
        );
        await expectNoAxeViolations(page);

        // Escape closes from any view; reopening shows the days
        await page.keyboard.press("Escape");
        await expectOutput(page, "reason", "escape-key");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(trigger).toBeFocused();
        await trigger.click();
        await expect(grid(page, monthHeading("en-US", 2027, 8))).toBeVisible();

        // a preset sets the value from the day view
        await page.getByRole("button", { name: "Today" }).click();
        await expectOutput(page, "value", "2026-11-20");
        await expect(page.getByRole("dialog")).toHaveCount(0);
    });
});

test.describe("calendar-view / typed", () => {
    test("a view's choice navigates; only a chosen day replaces the segments", async ({
        page,
    }) => {
        await openScenario(page, "/calendar-view/typed", { today: true });
        const group = fieldGroup(page, "Arrival");
        await segment(group, "month").focus();
        await typeKeys(page, "11242026");
        await expectOutput(page, "value", "2026-11-24");
        await expectOutput(page, "changes", "1");

        await page.getByRole("button", { name: "Arrival Choose date" }).click();
        await expectFocusWithin(day(page, 2026, 11, 24));
        await viewTrigger(page, monthHeading("en-US", 2026, 11)).click();
        await expectFocusWithin(month(page, 2026, 11));
        await expect(month(page, 2026, 11)).toHaveAttribute(
            "aria-selected",
            "true",
        );
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("Enter");
        await expect(grid(page, monthHeading("en-US", 2026, 1))).toBeVisible();
        await expectFocusWithin(day(page, 2026, 1, 24));
        await expectOutput(page, "changes", "1");
        await expect(segment(group, "month")).toHaveAttribute(
            "aria-valuenow",
            "11",
        );

        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "2026-01-24");
        await expectOutput(page, "changes", "2");
        await expect(segment(group, "month")).toHaveAttribute(
            "aria-valuenow",
            "1",
        );
        await expect(segment(group, "day")).toHaveAttribute(
            "aria-valuenow",
            "24",
        );
    });
});
