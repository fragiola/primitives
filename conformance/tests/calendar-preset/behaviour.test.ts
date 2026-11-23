import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { fullDate, monthHeading } from "../../src/dates.ts";
import { expectFocusWithin } from "../../src/focus.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";
import { fieldGroup, segment } from "../../src/segments.ts";

// spec/calendar.md, "Presets": today is fixed at 2026-11-20; every scenario is en-US

const cell = (scope: Page | Locator, month: number, day: number) =>
    scope.getByRole("gridcell", {
        name: fullDate("en-US", 2026, month, day),
        exact: true,
    });

test.describe("calendar-preset / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/calendar-preset/basic", { today: true });
    });

    test("a Calendar's presets set its date and show its month", async ({
        page,
    }) => {
        const date = page.getByRole("region", { name: "Date" });
        const christmas = date.getByRole("button", { name: "Christmas" });
        await christmas.click();
        await expectOutput(page, "date", "2026-12-25");
        await expectOutput(page, "reason", "item-press");
        await expect(
            date.getByRole("grid", {
                name: monthHeading("en-US", 2026, 12),
                exact: true,
            }),
        ).toBeVisible();
        await expect(cell(date, 12, 25)).toHaveAttribute(
            "aria-selected",
            "true",
        );
        await expect(christmas).toBeFocused();

        await date.getByRole("button", { name: "Today" }).click();
        await expectOutput(page, "date", "2026-11-20");
        await expect(
            date.getByRole("grid", {
                name: monthHeading("en-US", 2026, 11),
                exact: true,
            }),
        ).toBeVisible();

        await expect(
            date.getByRole("button", { name: "New Year" }),
        ).toBeDisabled();
    });

    test("a RangeCalendar's presets drop a started range and set theirs", async ({
        page,
    }) => {
        const range = page.getByRole("region", { name: "Range" });
        await cell(range, 11, 10).click();
        await range.getByRole("button", { name: "Next week" }).click();
        await expectOutput(page, "range", "2026-11-23..2026-11-29");
        for (const day of [23, 26, 29]) {
            await expect(cell(range, 11, day)).toHaveAttribute(
                "aria-selected",
                "true",
            );
        }
        await expect(cell(range, 11, 10)).not.toHaveAttribute(
            "aria-selected",
            "true",
        );
        await range.getByRole("button", { name: "Last 7 days" }).click();
        await expectOutput(page, "range", "2026-11-14..2026-11-20");
    });

    test("axe finds no violation", async ({ page }) => {
        await page.getByRole("button", { name: "Christmas" }).click();
        await expectNoAxeViolations(page);
    });
});

test.describe("calendar-preset / picker", () => {
    test("a preset is a choice: the value, the closed popup, the segments", async ({
        page,
    }) => {
        await openScenario(page, "/calendar-preset/picker", { today: true });
        const trigger = page.getByRole("button", {
            name: "Stay Choose dates",
            exact: true,
        });
        await trigger.click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await expectNoAxeViolations(page);
        await page.getByRole("button", { name: "Next week" }).click();
        await expectOutput(page, "value", "2026-11-23..2026-11-29");
        await expectOutput(page, "reason", "item-press");
        await expectOutput(page, "changes", "1");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(trigger).toBeFocused();
        await expect(
            segment(fieldGroup(page, "Stay Check-in"), "day"),
        ).toHaveAttribute("aria-valuenow", "23");
        await expect(
            segment(fieldGroup(page, "Stay Check-out"), "day"),
        ).toHaveAttribute("aria-valuenow", "29");

        await trigger.click();
        await expectFocusWithin(cell(page, 11, 23));
        for (const day of [23, 29]) {
            await expect(cell(page, 11, day)).toHaveAttribute(
                "aria-selected",
                "true",
            );
        }
    });
});
