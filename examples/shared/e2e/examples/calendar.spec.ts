import { expect, type FrameLocator, type Page, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// calendar: trip dates, a RangeCalendar over two months (spec/calendar.md). Today is fixed at
// Friday 2026-11-20, as in the conformance suite.

const TODAY = new Date(2026, 10, 20, 10, 0, 0);
const date = (month: number, day: number) => new Date(2026, month - 1, day);
const fullDate = (month: number, day: number) =>
    new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
        date(month, day),
    );
/** A cell of the grid of its own month (the other grid repeats it as an outside day). */
const cell = (frame: FrameLocator | Page, month: number, day: number) =>
    frame
        .getByRole("grid", {
            name: new Intl.DateTimeFormat("en-US", {
                month: "long",
                year: "numeric",
            }).format(date(month, 1)),
            exact: true,
        })
        .getByRole("gridcell", { name: fullDate(month, day), exact: true });
const stay = (start: [number, number], end: [number, number], nights: number) =>
    `${new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).formatRange(
        date(...start),
        date(...end),
    )}, ${nights} ${nights === 1 ? "night" : "nights"}`;

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(TODAY);
});

test("two months; two choices make a stay, hovering previews it", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "calendar" });
    const grids = frame.getByRole("grid");
    await expect(grids).toHaveCount(2);
    await expect(grids.first()).toHaveAttribute("aria-multiselectable", "true");
    await expect(
        frame.getByRole("grid", { name: "December 2026", exact: true }),
    ).toBeVisible();
    await expect(frame.getByRole("status")).toHaveText(
        "Choose your check-in, then your check-out.",
    );
    await cell(frame, 11, 28).click();
    await cell(frame, 12, 2).hover();
    await expect(cell(frame, 11, 30)).toHaveAttribute("data-range-preview", "");
    await expect(cell(frame, 12, 2)).toHaveAttribute(
        "data-primitives-part",
        "range-calendar-cell",
    );
    await cell(frame, 12, 2).click();
    await expect(frame.getByRole("status")).toHaveText(
        stay([11, 28], [12, 2], 4),
    );
    for (const [month, day] of [
        [11, 28],
        [11, 30],
        [12, 2],
    ] as const) {
        await expect(cell(frame, month, day)).toHaveAttribute(
            "aria-selected",
            "true",
        );
    }
    expect(errors).toEqual([]);
});

test("an end before the start swaps them; Escape cancels a started stay", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "calendar" });
    await cell(frame, 12, 10).click();
    await cell(frame, 12, 4).click();
    await expect(frame.getByRole("status")).toHaveText(
        stay([12, 4], [12, 10], 6),
    );
    await cell(frame, 11, 24).click();
    await page.keyboard.press("Escape");
    await cell(frame, 11, 26).click();
    // the Escape cancelled the start on the 24th: the 26th starts a new stay
    await expect(frame.getByRole("status")).toHaveText(
        stay([12, 4], [12, 10], 6),
    );
    await cell(frame, 11, 27).click();
    await expect(frame.getByRole("status")).toHaveText(
        stay([11, 26], [11, 27], 1),
    );
});

test("the page buttons move both months", async ({ page }) => {
    const frame = await openHosted(page, { id: "calendar" });
    await frame.getByRole("button", { name: "Next months" }).click();
    await expect(
        frame.getByRole("grid", { name: "January 2027", exact: true }),
    ).toBeVisible();
    await expect(
        frame.getByRole("grid", { name: "February 2027", exact: true }),
    ).toBeVisible();
    await frame.getByRole("button", { name: "Previous months" }).click();
    await expect(
        frame.getByRole("grid", { name: "November 2026", exact: true }),
    ).toBeVisible();
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("calendar");
    await page.clock.setFixedTime(TODAY);
    await page.goto(`${EMBED_BASE}?id=calendar`);
    await expect(page.getByRole("grid")).toHaveCount(2);
    expect(await axeViolations(page)).toEqual([]);
});
