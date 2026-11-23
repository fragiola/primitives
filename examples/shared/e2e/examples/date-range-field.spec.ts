import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// date-range-field: stay dates (spec/date-range-field.md). Today is fixed at Friday 2026-11-20, as
// in the conformance suite. A Field (Label "Stay"; Errors "Enter both dates.", "The stay cannot
// start in the past." and "Check-out cannot be before check-in.") around a required
// DateRangeField, `min` today, `startName="check-in"`, `endName="check-out"`, its ends
// "Check-in" and "Check-out", en-US; "Book" prints "Booked: <start> → <end>".

const TODAY = new Date(2026, 10, 20, 10, 0, 0);

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(TODAY);
});

test("typing moves on from the check-in to the check-out; Book submits both dates", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "date-range-field" });
    const start = frame.getByRole("group", { name: "Stay Check-in" });
    const end = frame.getByRole("group", { name: "Stay Check-out" });
    await expect(start).toHaveAttribute(
        "data-primitives-part",
        "date-range-field-input",
    );
    await expect(start.getByRole("spinbutton")).toHaveCount(3);
    await start.getByRole("spinbutton").first().focus();
    for (const key of "11232026") {
        await page.keyboard.press(key);
    }
    await expect(end.getByRole("spinbutton").first()).toBeFocused();
    for (const key of "11272026") {
        await page.keyboard.press(key);
    }
    await frame.getByRole("button", { name: "Book" }).click();
    await expect(frame.getByRole("status")).toHaveText(
        "Booked: 2026-11-23 → 2026-11-27",
    );
    expect(errors).toEqual([]);
});

test("no dates, or a check-out before the check-in, shows the error", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "date-range-field" });
    const start = frame.getByRole("group", { name: "Stay Check-in" });
    await frame.getByRole("button", { name: "Book" }).click();
    await expect(frame.getByText("Enter both dates.")).toBeVisible();
    await expect(start.getByRole("spinbutton").first()).toBeFocused();
    for (const key of "1127202611232026") {
        await page.keyboard.press(key);
    }
    await frame.getByRole("button", { name: "Book" }).click();
    await expect(
        frame.getByText("Check-out cannot be before check-in."),
    ).toBeVisible();
    await expect(frame.getByRole("status")).toHaveText("");
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("date-range-field");
    await page.clock.setFixedTime(TODAY);
    await page.goto(`${EMBED_BASE}?id=date-range-field`);
    await expect(page.getByRole("spinbutton")).toHaveCount(6);
    expect(await axeViolations(page)).toEqual([]);
});
