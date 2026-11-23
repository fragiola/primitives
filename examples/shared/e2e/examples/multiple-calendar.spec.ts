import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// multiple-calendar: the days you are available (spec/calendar.md, "Multiple dates"). Today is
// fixed at Friday 2026-11-20. A MultipleCalendar `name="days"`, `maxSelected` 5, `min` today,
// en-US; "Save" prints "Saved: <ISO dates joined by ', '>".

const TODAY = new Date(2026, 10, 20, 10, 0, 0);

const fullDate = (day: number) =>
    new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
        new Date(2026, 10, day),
    );

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(TODAY);
});

test("pressing days toggles them, up to five, and the form submits each", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "multiple-calendar" });
    const grid = frame.getByRole("grid");
    await expect(grid).toHaveAttribute("aria-multiselectable", "true");
    for (const day of [27, 23, 24, 25, 26]) {
        await frame.getByRole("gridcell", { name: fullDate(day) }).click();
    }
    // a sixth day is over the limit
    await frame.getByRole("gridcell", { name: fullDate(28) }).click();
    await expect(
        frame.getByRole("gridcell", { name: fullDate(28) }),
    ).not.toHaveAttribute("aria-selected", "true");
    // a chosen day pressed again is removed
    await frame.getByRole("gridcell", { name: fullDate(27) }).click();
    await expect(
        frame.getByRole("gridcell", { name: fullDate(27) }),
    ).not.toHaveAttribute("aria-selected", "true");
    // days before today are disabled
    await expect(
        frame.getByRole("gridcell", { name: fullDate(19) }),
    ).toHaveAttribute("aria-disabled", "true");
    await frame.getByRole("button", { name: "Save" }).click();
    await expect(frame.getByRole("status")).toHaveText(
        "Saved: 2026-11-23, 2026-11-24, 2026-11-25, 2026-11-26",
    );
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("multiple-calendar");
    await page.goto(`${EMBED_BASE}?id=multiple-calendar`);
    await page.getByRole("gridcell", { name: fullDate(24) }).click();
    expect(await axeViolations(page)).toEqual([]);
});
