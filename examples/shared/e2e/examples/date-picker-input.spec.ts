import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// date-picker-input: a departure date typed or picked (spec/calendar.md, "Typed input"). Today is
// fixed at Friday 2026-11-20. A Field `name="departure"` (Label "Departure"; Error "Enter a
// departure date from today on.") around a required DatePickerInput, `min` today, en-US: its
// segments, a Trigger "Choose date" and a popup "Departure date" with a Calendar; "Save" prints
// "Saved: <ISO>".

const TODAY = new Date(2026, 10, 20, 10, 0, 0);

const fullDate = (day: number) =>
    new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
        new Date(2026, 10, day),
    );

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(TODAY);
});

test("typing a date sets it; the calendar opens on it and fills the segments", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "date-picker-input" });
    const group = frame.getByRole("group", { name: "Departure" });
    await expect(group).toHaveAttribute(
        "data-primitives-part",
        "date-picker-segments",
    );
    const parts = group.getByRole("spinbutton");
    await parts.first().focus();
    for (const key of "11242026") {
        await page.keyboard.press(key);
    }
    await frame.getByRole("button", { name: "Departure Choose date" }).click();
    const chosen = frame.getByRole("gridcell", { name: fullDate(24) });
    await expect(chosen).toHaveAttribute("aria-selected", "true");
    await frame.getByRole("gridcell", { name: fullDate(27) }).click();
    await expect(parts.nth(1)).toHaveAttribute("aria-valuenow", "27");
    await frame.getByRole("button", { name: "Save" }).click();
    await expect(frame.getByRole("status")).toHaveText("Saved: 2026-11-27");
    expect(errors).toEqual([]);
});

test("a typed day before today is no value: saving shows the error", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "date-picker-input" });
    const parts = frame
        .getByRole("group", { name: "Departure" })
        .getByRole("spinbutton");
    await parts.first().focus();
    for (const key of "11102026") {
        await page.keyboard.press(key);
    }
    await expect(parts.first()).toHaveAttribute("aria-invalid", "true");
    await frame.getByRole("button", { name: "Save" }).click();
    await expect(
        frame.getByText("Enter a departure date from today on."),
    ).toBeVisible();
    await expect(parts.first()).toBeFocused();
    await expect(frame.getByRole("status")).toHaveText("");
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("date-picker-input");
    await page.clock.setFixedTime(TODAY);
    await page.goto(`${EMBED_BASE}?id=date-picker-input`);
    await expect(page.getByRole("spinbutton")).toHaveCount(3);
    expect(await axeViolations(page)).toEqual([]);
});
