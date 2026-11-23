import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";
import {
    expectPlaceholders,
    fieldGroup,
    segment,
    segmentName,
    spinbuttons,
    typeKeys,
    validity,
} from "../../src/segments.ts";

// spec/date-range-field.md, DateRangeField. Every scenario fixes today at 2026-11-20 (en-US)

/** The hidden input of one end of the first (or `index`th) range field. */
function hiddenInput(page: Page, end: "start" | "end", index = 0) {
    return page
        .locator(
            `[data-primitives-part="date-range-field-hidden-input"][data-range="${end}"]`,
        )
        .nth(index);
}

test.describe("date-range-field / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/date-range-field/basic", { today: true });
    });

    test("two groups named by the label and their own names", async ({
        page,
    }) => {
        const start = fieldGroup(page, "Stay Start date");
        const end = fieldGroup(page, "Stay End date");
        await expect(spinbuttons(start)).toHaveCount(3);
        await expect(spinbuttons(end)).toHaveCount(3);
        const month = await segmentName(page, "en-US", "month");
        await expect(
            page.getByRole("spinbutton", {
                name: `Stay Start date ${month}`,
                exact: true,
            }),
        ).toHaveAttribute("data-type", "month");
        await expect(
            page.getByRole("spinbutton", {
                name: `Stay End date ${month}`,
                exact: true,
            }),
        ).toHaveAttribute("data-type", "month");
        await expectPlaceholders(start);
        await expectPlaceholders(end);
    });

    test("typing goes on from the start into the end, one value for both", async ({
        page,
    }) => {
        const start = fieldGroup(page, "Stay Start date");
        const end = fieldGroup(page, "Stay End date");
        await segment(start, "month").focus();
        await typeKeys(page, "11232026");
        await expect(segment(end, "month")).toBeFocused();
        await expectOutput(page, "value", "none");
        await expectOutput(page, "reason", "none");
        await typeKeys(page, "11272026");
        await expectOutput(page, "value", "2026-11-23..2026-11-27");
        await expectOutput(page, "reason", "input-change");

        // the arrows cross the ends
        await segment(end, "month").focus();
        await page.keyboard.press("ArrowLeft");
        await expect(segment(start, "year")).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(segment(end, "month")).toBeFocused();

        // Backspace empties the end, then crosses back into the start
        await page.keyboard.press("Backspace");
        await page.keyboard.press("Backspace");
        await expectOutput(page, "value", "none");
        await expectOutput(page, "reason", "input-clear");
        await page.keyboard.press("Backspace");
        await expect(segment(start, "year")).toBeFocused();

        // the end's day and year were kept
        await page.keyboard.press("ArrowRight");
        await expect(segment(end, "month")).toBeFocused();
        await typeKeys(page, "11");
        await expectOutput(page, "value", "2026-11-23..2026-11-27");
    });

    test("an end before the start is invalid", async ({ page }) => {
        const root = page.locator(
            '[data-primitives-part="date-range-field-root"]',
        );
        const start = fieldGroup(page, "Stay Start date");
        const end = fieldGroup(page, "Stay End date");
        await segment(start, "month").focus();
        await typeKeys(page, "1123202611272026");
        await expectOutput(page, "value", "2026-11-23..2026-11-27");
        const day = segment(end, "day");
        await day.focus();
        for (let step = 0; step < 7; step += 1) {
            await page.keyboard.press("ArrowDown");
        }
        await expectOutput(page, "value", "2026-11-23..2026-11-20");
        await expectOutput(page, "reason", "keyboard");
        await expect(root).toHaveAttribute("data-invalid", "");
        for (const group of [start, end]) {
            for (const type of ["month", "day", "year"]) {
                await expect(segment(group, type)).toHaveAttribute(
                    "aria-invalid",
                    "true",
                );
            }
        }
        expect(await validity(hiddenInput(page, "start"))).toEqual([
            "rangeOverflow",
        ]);
        expect(await validity(hiddenInput(page, "end"))).toEqual([
            "rangeUnderflow",
        ]);
        await expectNoAxeViolations(page);

        for (let step = 0; step < 7; step += 1) {
            await page.keyboard.press("ArrowUp");
        }
        await expectOutput(page, "value", "2026-11-23..2026-11-27");
        await expect(root).not.toHaveAttribute("data-invalid");
        await expect(day).not.toHaveAttribute("aria-invalid");
        expect(await validity(hiddenInput(page, "start"))).toEqual(["valid"]);
    });

    test("a press on the label focuses the start's first segment", async ({
        page,
    }) => {
        await page.getByText("Stay", { exact: true }).click();
        await expect(
            segment(fieldGroup(page, "Stay Start date"), "month"),
        ).toBeFocused();
    });

    test("moving between the ends is no blur; leaving the field is", async ({
        page,
    }) => {
        const field = page.locator('[data-primitives-part="field-root"]');
        const start = fieldGroup(page, "Stay Start date");
        await segment(start, "year").focus();
        await page.keyboard.press("ArrowRight");
        await expect(
            segment(fieldGroup(page, "Stay End date"), "month"),
        ).toBeFocused();
        await page.keyboard.press("ArrowLeft");
        await expect(segment(start, "year")).toBeFocused();
        await expect(field).toHaveAttribute("data-focused", "");
        await expect(field).not.toHaveAttribute("data-touched");
        await page.evaluate(() =>
            (document.activeElement as HTMLElement).blur(),
        );
        await expect(field).toHaveAttribute("data-touched", "");
        await expect(field).not.toHaveAttribute("data-focused");
    });

    test("no axe violation, empty and filled", async ({ page }) => {
        await expectNoAxeViolations(page);
        await segment(fieldGroup(page, "Stay Start date"), "month").focus();
        await typeKeys(page, "1123202611272026");
        await expectOutput(page, "value", "2026-11-23..2026-11-27");
        await expectNoAxeViolations(page);
    });
});

test.describe("date-range-field / form", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/date-range-field/form", { today: true });
    });

    test("required, submitted as two ISO dates, an end before the start refused", async ({
        page,
    }) => {
        const start = fieldGroup(page, "Check-in");
        const end = fieldGroup(page, "Check-out");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
        await expect(segment(start, "month")).toBeFocused();
        await typeKeys(page, "1123202611272026");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(
            page,
            "checkin=2026-11-23&checkout=2026-11-27&from=2026-11-20&to=2026-11-22",
        );

        await segment(end, "day").focus();
        for (let step = 0; step < 5; step += 1) {
            await page.keyboard.press("ArrowDown");
        }
        await segment(start, "day").focus();
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("ArrowUp");
        await expect(segment(start, "day")).toHaveAttribute(
            "aria-valuenow",
            "25",
        );
        await page.getByRole("button", { name: "Submit" }).click();
        // the submission is refused: the output keeps the last one
        await expect(segment(start, "month")).toBeFocused();
        await expectSubmitted(
            page,
            "checkin=2026-11-23&checkout=2026-11-27&from=2026-11-20&to=2026-11-22",
        );
        expect(await validity(hiddenInput(page, "start"))).toEqual([
            "rangeOverflow",
        ]);
    });

    test("a read-only range is focusable and does not change", async ({
        page,
    }) => {
        const month = segment(fieldGroup(page, "From"), "month");
        await month.focus();
        await expect(month).toBeFocused();
        await month.press("ArrowUp");
        await expect(month).toHaveAttribute("aria-valuenow", "11");
        await expect(month).toHaveAttribute("aria-readonly", "true");
        await expect(month).not.toHaveAttribute("contenteditable");
    });

    test("a reset makes both ends placeholders again", async ({ page }) => {
        const start = fieldGroup(page, "Check-in");
        const end = fieldGroup(page, "Check-out");
        await segment(start, "month").focus();
        await typeKeys(page, "1123202611272026");
        await expect(segment(end, "year")).toHaveAttribute(
            "aria-valuenow",
            "2026",
        );
        await page.getByRole("button", { name: "Reset" }).click();
        await expectPlaceholders(start);
        await expectPlaceholders(end);
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
        await expectNoAxeViolations(page);
    });
});
