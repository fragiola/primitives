import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// month-picker: a card's expiry (spec/month-calendar.md). Today is fixed at 2026-11-20. A Field
// `name="expiry"` (Label "Expiry date"; Error "Choose the card's expiry month.") around a required
// MonthPicker, `min` this month, en-US: a trigger, a popup "Expiry month" with a MonthCalendar;
// "Save" prints "Saved: expiry=<ISO month>".

const TODAY = new Date(2026, 10, 20, 10, 0, 0);

const monthName = (year: number, month: number) =>
    new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
        new Date(year, month - 1, 1),
    );

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(TODAY);
});

test("saving with no month shows the error; a chosen month is submitted", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "month-picker" });
    const trigger = frame.getByRole("button", { name: /Expiry date/ });
    await frame.getByRole("button", { name: "Save" }).click();
    await expect(
        frame.getByText("Choose the card's expiry month."),
    ).toBeVisible();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(
        frame.getByRole("dialog", { name: "Expiry month" }),
    ).toBeVisible();
    await expect(
        frame.getByRole("gridcell", { name: monthName(2026, 10) }),
    ).toHaveAttribute("aria-disabled", "true");
    await frame.getByRole("button", { name: "Next year" }).click();
    await frame.getByRole("gridcell", { name: monthName(2027, 3) }).click();
    await expect(frame.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger).toContainText("03/2027");
    await frame.getByRole("button", { name: "Save" }).click();
    await expect(frame.getByRole("status")).toHaveText("Saved: expiry=2027-03");
    expect(errors).toEqual([]);
});

test("axe finds no violation, open", async ({ page }) => {
    requireExamples("month-picker");
    await page.goto(`${EMBED_BASE}?id=month-picker`);
    await page.getByRole("button", { name: /Expiry date/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
