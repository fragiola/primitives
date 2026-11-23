import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// date-field: a birth date (spec/date-field.md). Today is fixed at Friday 2026-11-20, as in the
// conformance suite. A Field `name="birth-date"` (Label "Birth date"; Errors "Enter your birth
// date." and "The date cannot be in the future.") around a required DateField, `max` today,
// en-US; "Save" prints "Saved: <ISO>".

const TODAY = new Date(2026, 10, 20, 10, 0, 0);

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(TODAY);
});

test("typing fills the parts and moves on; Save submits the ISO date", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "date-field" });
    const group = frame.getByRole("group", { name: "Birth date" });
    await expect(group).toHaveAttribute(
        "data-primitives-part",
        "date-field-input",
    );
    const parts = group.getByRole("spinbutton");
    await expect(parts).toHaveCount(3);
    await parts.first().focus();
    for (const key of "11231990") {
        await page.keyboard.press(key);
    }
    await expect(parts.nth(2)).toHaveAttribute("aria-valuenow", "1990");
    await parts.nth(2).press("ArrowUp");
    await expect(parts.nth(2)).toHaveAttribute("aria-valuenow", "1991");
    await frame.getByRole("button", { name: "Save" }).click();
    await expect(frame.getByRole("status")).toHaveText("Saved: 1991-11-23");
    expect(errors).toEqual([]);
});

test("saving with no date, or a date after today, shows the error", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "date-field" });
    const parts = frame
        .getByRole("group", { name: "Birth date" })
        .getByRole("spinbutton");
    await frame.getByRole("button", { name: "Save" }).click();
    await expect(frame.getByText("Enter your birth date.")).toBeVisible();
    await expect(parts.first()).toBeFocused();
    for (const key of "12012026") {
        await page.keyboard.press(key);
    }
    await frame.getByRole("button", { name: "Save" }).click();
    await expect(
        frame.getByText("The date cannot be in the future."),
    ).toBeVisible();
    await expect(frame.getByRole("status")).toHaveText("");
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("date-field");
    await page.clock.setFixedTime(TODAY);
    await page.goto(`${EMBED_BASE}?id=date-field`);
    await expect(page.getByRole("spinbutton")).toHaveCount(3);
    expect(await axeViolations(page)).toEqual([]);
});
