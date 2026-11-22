import { expect, type FrameLocator, type Page, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    promoted,
    requireExamples,
} from "../helpers.ts";

// date-picker: a booking form (spec/calendar.md). Today is fixed at Friday 2026-11-20, as in the
// conformance suite. The picker's popup is non-modal: never promoted.

const TODAY = new Date(2026, 10, 20, 10, 0, 0);
const fullDate = (month: number, day: number) =>
    new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
        new Date(2026, month - 1, day),
    );
const cell = (frame: FrameLocator | Page, month: number, day: number) =>
    frame.getByRole("gridcell", { name: fullDate(month, day), exact: true });

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(TODAY);
});

test("the trigger opens a calendar on today; choosing a day closes it and fills the form", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "date-picker" });
    const trigger = frame.getByRole("button", { name: /^Check-in:/ });
    await expect(trigger).toHaveAttribute(
        "data-primitives-part",
        "date-picker-trigger",
    );
    await expect(trigger).toHaveText("Check-in: choose a date");
    await trigger.click();
    const dialog = frame.getByRole("dialog", { name: "Check-in date" });
    await expect(dialog).toBeVisible();
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    expect(await promoted(page)).toBe(false);
    await expect(
        dialog.getByRole("grid", { name: "November 2026" }),
    ).toBeVisible();
    await expect(cell(frame, 11, 20)).toBeFocused();
    // past days are disabled: the keyboard cannot reach them
    await expect(cell(frame, 11, 19)).toHaveAttribute("aria-disabled", "true");
    await page.keyboard.press("ArrowLeft");
    await expect(cell(frame, 11, 20)).toBeFocused();
    // four days on, then Enter: the picker closes on the trigger
    for (let index = 0; index < 4; index++) {
        await page.keyboard.press("ArrowRight");
    }
    await page.keyboard.press("Enter");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveText("Check-in: Nov 24, 2026");
    await frame.getByRole("button", { name: "Book" }).click();
    await expect(frame.getByRole("status")).toHaveText("Booked: 2026-11-24");
    expect(errors).toEqual([]);
});

test("Escape closes, and reopening focuses the chosen day", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "date-picker" });
    const trigger = frame.getByRole("button", { name: /^Check-in:/ });
    await trigger.click();
    await frame.getByRole("button", { name: "Next month" }).click();
    await expect(
        frame.getByRole("grid", { name: "December 2026" }),
    ).toBeVisible();
    await cell(frame, 12, 3).click();
    await expect(trigger).toHaveText("Check-in: Dec 3, 2026");
    await trigger.click();
    await expect(cell(frame, 12, 3)).toBeFocused();
    await expect(cell(frame, 12, 3)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Escape");
    await expect(frame.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();
});

test("axe finds no violation with the calendar open", async ({ page }) => {
    requireExamples("date-picker");
    await page.goto(`${EMBED_BASE}?id=date-picker`);
    await page.getByRole("button", { name: /^Check-in:/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
