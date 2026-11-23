import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    part,
    requireExamples,
} from "../helpers.ts";

// calendar-preset: a report period (spec/calendar.md, "Presets"). Today is fixed at Friday
// 2026-11-20. A DateRangePicker (`max` today, en-US, starting on the last 7 days) whose popup
// "Report period" holds a RangeCalendar with the presets "Last 7 days", "Last 30 days" and "This
// month"; the trigger shows the range (`Intl` `formatRange`).

const TODAY = new Date(2026, 10, 20, 10, 0, 0);

const period = (fromMonth: number, fromDay: number, toDay: number) =>
    new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).formatRange(
        new Date(2026, fromMonth - 1, fromDay),
        new Date(2026, 10, toDay),
    );
const fullDate = (day: number) =>
    new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
        new Date(2026, 10, day),
    );

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(TODAY);
});

test("a preset sets the range in one press and closes the popup", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "calendar-preset" });
    const trigger = frame.getByRole("button", { name: period(11, 14, 20) });
    await trigger.click();
    const dialog = frame.getByRole("dialog", { name: "Report period" });
    await expect(dialog).toBeVisible();
    await expect(
        dialog.locator(part("range-calendar-preset")).first(),
    ).toHaveAttribute("data-selected", "");
    await dialog.getByRole("button", { name: "This month" }).click();
    await expect(frame.getByRole("dialog")).toHaveCount(0);
    await expect(
        frame.getByRole("button", { name: period(11, 1, 20) }),
    ).toBeFocused();

    await frame.getByRole("button", { name: period(11, 1, 20) }).click();
    await frame.getByRole("button", { name: "Last 30 days" }).click();
    await expect(
        frame.getByRole("button", { name: period(10, 22, 20) }),
    ).toBeVisible();

    // any other period: two days of the calendar (it opens on the range's start, in October)
    await frame.getByRole("button", { name: period(10, 22, 20) }).click();
    await frame.getByRole("button", { name: "Next month" }).click();
    await frame.getByRole("gridcell", { name: fullDate(2) }).click();
    await frame.getByRole("gridcell", { name: fullDate(6) }).click();
    await expect(
        frame.getByRole("button", { name: period(11, 2, 6) }),
    ).toBeVisible();
    expect(errors).toEqual([]);
});

test("axe finds no violation, open", async ({ page }) => {
    requireExamples("calendar-preset");
    await page.goto(`${EMBED_BASE}?id=calendar-preset`);
    await page.getByRole("button", { name: period(11, 14, 20) }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
