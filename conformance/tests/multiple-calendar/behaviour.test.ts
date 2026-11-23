import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { fullDate, monthHeading } from "../../src/dates.ts";
import { expectFocusWithin } from "../../src/focus.ts";
import { expectSubmitted, resetForm } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/calendar.md, "Multiple dates": today is fixed at 2026-11-20; every scenario is en-US

const cell = (page: Page, month: number, day: number, year = 2026) =>
    page.getByRole("gridcell", {
        name: fullDate("en-US", year, month, day),
        exact: true,
    });

test.describe("multiple-calendar / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/multiple-calendar/basic", { today: true });
    });

    test("a multiselectable grid with today's tab stop", async ({ page }) => {
        const grid = page.getByRole("grid", {
            name: monthHeading("en-US", 2026, 11),
            exact: true,
        });
        await expect(grid).toHaveAttribute("aria-multiselectable", "true");
        await expect(cell(page, 11, 20)).toHaveAttribute("tabindex", "0");
    });

    test("a press or Enter / Space toggles a date, sorted, up to maxSelected", async ({
        page,
    }) => {
        await cell(page, 11, 10).click();
        await cell(page, 11, 24).click();
        await expectOutput(page, "value", "2026-11-10,2026-11-24");
        await expectOutput(page, "reason", "item-press");
        await expect(cell(page, 11, 10)).toHaveAttribute(
            "aria-selected",
            "true",
        );
        await expect(cell(page, 11, 24)).toHaveAttribute(
            "aria-selected",
            "true",
        );

        await cell(page, 11, 3).click();
        await expectOutput(page, "value", "2026-11-03,2026-11-10,2026-11-24");

        // a fourth date is over maxSelected: nothing changes
        await cell(page, 11, 12).click();
        await expectOutput(page, "value", "2026-11-03,2026-11-10,2026-11-24");
        await expect(cell(page, 11, 12)).not.toHaveAttribute(
            "aria-selected",
            "true",
        );
        await expectFocusWithin(cell(page, 11, 12));

        // Enter removes a chosen date, the focus stays on it
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "2026-11-03,2026-11-24");
        await expectFocusWithin(cell(page, 11, 10));
        await expect(cell(page, 11, 10)).not.toHaveAttribute(
            "aria-selected",
            "true",
        );

        await page.keyboard.press("ArrowRight");
        await page.keyboard.press(" ");
        await expectOutput(page, "value", "2026-11-03,2026-11-11,2026-11-24");
    });

    test("axe finds no violation", async ({ page }) => {
        await cell(page, 11, 10).click();
        await expectNoAxeViolations(page);
    });
});

test.describe("multiple-calendar / form", () => {
    test("one entry per chosen date, a reset back to the default", async ({
        page,
    }) => {
        await openScenario(page, "/multiple-calendar/form", { today: true });
        const submit = page.getByRole("button", { name: "Submit" });
        await submit.click();
        await expectSubmitted(page, "days=2026-11-20");

        await cell(page, 11, 24).click();
        await submit.click();
        await expectSubmitted(page, "days=2026-11-20&days=2026-11-24");

        await cell(page, 11, 20).click();
        await submit.click();
        await expectSubmitted(page, "days=2026-11-24");

        await resetForm(page);
        await expect(cell(page, 11, 20)).toHaveAttribute(
            "aria-selected",
            "true",
        );
        await submit.click();
        await expectSubmitted(page, "days=2026-11-20");
        await expect(cell(page, 11, 24)).not.toHaveAttribute(
            "aria-selected",
            "true",
        );
    });
});
