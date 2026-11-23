import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { fullDate } from "../../src/dates.ts";
import { expectFocusWithin } from "../../src/focus.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";
import {
    dayPeriods,
    fieldGroup,
    segment,
    spinbuttons,
    typeKeys,
} from "../../src/segments.ts";

// spec/calendar.md, "Typed input": a picker whose date is also typed into segments. Today is
// fixed at 2026-11-20; every scenario is en-US

/** A calendar cell by its full date (the cell's name is the full date). */
const cell = (page: Page, month: number, day: number, year = 2026) =>
    page.getByRole("gridcell", {
        name: fullDate("en-US", year, month, day),
        exact: true,
    });

test.describe("date-picker-input / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/date-picker-input/basic", { today: true });
    });

    test("a group named by the label, the trigger by the label and itself", async ({
        page,
    }) => {
        const group = fieldGroup(page, "Arrival");
        await expect(spinbuttons(group)).toHaveCount(3);
        const trigger = page.getByRole("button", {
            name: "Arrival Choose date",
            exact: true,
        });
        await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
        await expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    test("typing, the calendar and the segments bound both ways, with no loop", async ({
        page,
    }) => {
        const group = fieldGroup(page, "Arrival");
        const trigger = page.getByRole("button", {
            name: "Arrival Choose date",
        });
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
        await expect(segment(group, "month")).toBeFocused();

        // a complete, valid entry sets the value once (the years on the way are before min)
        await typeKeys(page, "11242026");
        await expectOutput(page, "value", "2026-11-24");
        await expectOutput(page, "reason", "input-change");
        await expectOutput(page, "changes", "1");

        // the calendar opens on it
        await trigger.click();
        await expectFocusWithin(cell(page, 11, 24));
        await expect(cell(page, 11, 24)).toHaveAttribute(
            "aria-selected",
            "true",
        );

        // a chosen date fills the segments
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "2026-11-26");
        await expectOutput(page, "reason", "item-press");
        await expectOutput(page, "changes", "2");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(trigger).toBeFocused();
        await expect(segment(group, "day")).toHaveAttribute(
            "aria-valuenow",
            "26",
        );

        // an incomplete entry: no value, and the calendar never clears the typed segments
        await segment(group, "day").focus();
        await page.keyboard.press("Backspace");
        await page.keyboard.press("Backspace");
        await expectOutput(page, "value", "none");
        await expectOutput(page, "reason", "input-clear");
        await expectOutput(page, "changes", "3");
        await expect(segment(group, "month")).toHaveAttribute(
            "aria-valuenow",
            "11",
        );
        await trigger.click();
        await expectFocusWithin(cell(page, 11, 20));
        await expect(
            page.locator('[role="gridcell"][aria-selected="true"]'),
        ).toHaveCount(0);
        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(segment(group, "month")).toHaveAttribute(
            "aria-valuenow",
            "11",
        );
        await expect(segment(group, "day")).toHaveAttribute(
            "data-placeholder",
            "",
        );
        await expect(segment(group, "year")).toHaveAttribute(
            "aria-valuenow",
            "2026",
        );

        // complete but before min: invalid, nothing reported
        await segment(group, "day").focus();
        await typeKeys(page, "05");
        await expect(segment(group, "day")).toHaveAttribute(
            "aria-valuenow",
            "5",
        );
        await expectOutput(page, "changes", "3");
        await expect(group).toHaveAttribute("data-invalid", "");
        for (const type of ["month", "day", "year"]) {
            await expect(segment(group, type)).toHaveAttribute(
                "aria-invalid",
                "true",
            );
        }

        // a step into the range sets it
        await segment(group, "day").focus();
        for (let step = 0; step < 5; step += 1) {
            await page.keyboard.press("ArrowUp");
        }
        await expectOutput(page, "value", "2026-11-10");
        await expectOutput(page, "reason", "keyboard");
        await expectOutput(page, "changes", "4");
        await expect(group).not.toHaveAttribute("data-invalid");

        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "arrival=2026-11-10");
    });

    test("a press on the label focuses the first segment", async ({ page }) => {
        await page.getByText("Arrival", { exact: true }).click();
        await expect(
            segment(fieldGroup(page, "Arrival"), "month"),
        ).toBeFocused();
    });

    test("no axe violation, closed and open", async ({ page }) => {
        await expectNoAxeViolations(page);
        await page.getByRole("button", { name: "Arrival Choose date" }).click();
        await expectFocusWithin(cell(page, 11, 20));
        await expectNoAxeViolations(page);
    });
});

test("date-picker-input / range: two ends typed, the range calendar filling both", async ({
    page,
}) => {
    await openScenario(page, "/date-picker-input/range", { today: true });
    const start = fieldGroup(page, "Stay Check-in");
    const end = fieldGroup(page, "Stay Check-out");
    const trigger = page.getByRole("button", {
        name: "Stay Choose dates",
        exact: true,
    });
    await expect(trigger).toBeVisible();
    await segment(start, "month").focus();
    await typeKeys(page, "11232026");
    await expect(segment(end, "month")).toBeFocused();
    await typeKeys(page, "11272026");
    await expectOutput(page, "value", "2026-11-23..2026-11-27");
    await expectOutput(page, "reason", "input-change");

    await trigger.click();
    for (const day of [23, 24, 25, 26, 27]) {
        await expect(cell(page, 11, day)).toHaveAttribute(
            "aria-selected",
            "true",
        );
    }
    await cell(page, 11, 10).click();
    await cell(page, 11, 13).click();
    await expectOutput(page, "value", "2026-11-10..2026-11-13");
    await expectOutput(page, "reason", "item-press");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(segment(start, "day")).toHaveAttribute("aria-valuenow", "10");
    await expect(segment(end, "day")).toHaveAttribute("aria-valuenow", "13");

    // the end before the start: no value, every segment invalid
    await segment(end, "day").focus();
    for (let step = 0; step < 4; step += 1) {
        await page.keyboard.press("ArrowDown");
    }
    await expectOutput(page, "value", "none");
    await expectOutput(page, "reason", "keyboard");
    for (const group of [start, end]) {
        await expect(segment(group, "day")).toHaveAttribute(
            "aria-invalid",
            "true",
        );
    }
    await expectNoAxeViolations(page);
});

test("date-picker-input / date-time: the calendar chooses the date, the time is typed", async ({
    page,
}) => {
    await openScenario(page, "/date-picker-input/date-time", { today: true });
    const group = fieldGroup(page, "Meeting");
    await expect(spinbuttons(group)).toHaveCount(6);
    const trigger = page.getByRole("button", {
        name: "Meeting Choose date",
        exact: true,
    });
    await trigger.click();
    await expectFocusWithin(cell(page, 11, 20));
    await page.keyboard.press("Enter");
    // the time's placeholders take midnight
    await expectOutput(page, "value", "2026-11-20T00:00");
    await expectOutput(page, "reason", "item-press");
    await expect(segment(group, "hour")).toHaveAttribute("aria-valuenow", "12");
    const [am, pm] = await dayPeriods(page, "en-US");
    await expect(segment(group, "dayPeriod")).toHaveAttribute(
        "aria-valuetext",
        am,
    );

    await segment(group, "hour").focus();
    await typeKeys(page, "230");
    await page.keyboard.press(pm.charAt(0).toLowerCase());
    await expectOutput(page, "value", "2026-11-20T14:30");
    await expectOutput(page, "reason", "input-change");

    // a new date keeps the typed time
    await trigger.click();
    await expectFocusWithin(cell(page, 11, 20));
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expectOutput(page, "value", "2026-11-21T14:30");
    await expectOutput(page, "reason", "item-press");
});
