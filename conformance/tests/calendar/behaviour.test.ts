import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import {
    fullDate,
    monthHeading,
    shortWeekday,
    yearName,
} from "../../src/dates.ts";
import { expectFocusWithin } from "../../src/focus.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/calendar.md: today is fixed at 2026-11-20 (a Friday)
//
// A cell is found by the full date its name ends with: the spec's name is exactly the full date,
// the contract layer checks that, and the behaviour layer only needs to find the cell. A cell is
// looked up in the grid of its month when two months are visible, since the outside-month days of
// one grid repeat the dates of the other.
const cell = (
    page: Page,
    month: number,
    day: number,
    year = 2026,
    locale = "en-US",
) =>
    page.getByRole("gridcell", {
        name: dateName(fullDate(locale, year, month, day)),
    });

/**
 * A cell name that ends with the full date, allowing a trailing note with no digit in it, so it
 * can never be another date (a consumer's `aria-label` may add one).
 */
function dateName(full: string): RegExp {
    const escaped = full.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|, )${escaped}([ ,][^0-9]*)?$`);
}
const grid = (page: Page, year: number, month: number, locale = "en-US") =>
    page.getByRole("grid", {
        name: monthHeading(locale, year, month),
        exact: true,
    });

/** Puts focus on the grid's focused date, the way a keyboard user enters it. */
async function tabIntoGrid(page: Page) {
    await page.getByRole("button", { name: "Next month" }).focus();
    await page.keyboard.press("Tab");
}

test.describe("calendar / single", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/calendar/single", { today: true });
    });

    test("a grid named by its month, with locale weekday headers", async ({
        page,
    }) => {
        await expect(grid(page, 2026, 11)).toBeVisible();
        const headers = page.getByRole("columnheader");
        await expect(headers).toHaveCount(7);
        await expect(headers.first()).toHaveText(
            shortWeekday("en-US", 2026, 11, 1),
        );
    });

    test("today holds the tab stop", async ({ page }) => {
        await tabIntoGrid(page);
        await expectFocusWithin(cell(page, 11, 20));
    });

    test("today is marked as the current date", async ({ page }) => {
        await expect(cell(page, 11, 20)).toHaveAttribute(
            "aria-current",
            "date",
        );
    });

    test("arrows move the focused date across weeks and months", async ({
        page,
    }) => {
        await tabIntoGrid(page);
        await page.keyboard.press("ArrowRight");
        await expectFocusWithin(cell(page, 11, 21));
        await page.keyboard.press("ArrowDown");
        await expectFocusWithin(cell(page, 11, 28));
        await page.keyboard.press("ArrowDown");
        await expectFocusWithin(cell(page, 12, 5));
        await expect(grid(page, 2026, 12)).toBeVisible();
        await page.keyboard.press("ArrowUp");
        await expectFocusWithin(cell(page, 11, 28));
        await expect(grid(page, 2026, 11)).toBeVisible();
    });

    test("Home and End move to the start and end of the week", async ({
        page,
    }) => {
        await tabIntoGrid(page);
        await page.keyboard.press("ArrowDown");
        await expectFocusWithin(cell(page, 11, 27));
        await page.keyboard.press("Home");
        await expectFocusWithin(cell(page, 11, 22));
        await page.keyboard.press("End");
        await expectFocusWithin(cell(page, 11, 28));
    });

    test("PageUp/PageDown move by month, with Shift by year", async ({
        page,
    }) => {
        await tabIntoGrid(page);
        await page.keyboard.press("ArrowDown");
        await expectFocusWithin(cell(page, 11, 27));
        await page.keyboard.press("ArrowRight");
        await expectFocusWithin(cell(page, 11, 28));
        await page.keyboard.press("PageDown");
        await expectFocusWithin(cell(page, 12, 28));
        await page.keyboard.press("PageUp");
        await expectFocusWithin(cell(page, 11, 28));
        await page.keyboard.press("Shift+PageDown");
        await expectFocusWithin(cell(page, 11, 28, 2027));
        await expect(grid(page, 2027, 11)).toBeVisible();
        await page.keyboard.press("Shift+PageUp");
        await expectFocusWithin(cell(page, 11, 28));
    });

    test("Enter chooses the focused date", async ({ page }) => {
        await tabIntoGrid(page);
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowRight");
        await expectFocusWithin(cell(page, 11, 28));
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "2026-11-28");
        await expect(cell(page, 11, 28)).toHaveAttribute(
            "aria-selected",
            "true",
        );
    });

    test("two quick keys across a month reach the new month's cell", async ({
        page,
    }) => {
        await tabIntoGrid(page);
        await page.keyboard.press("ArrowDown");
        await expectFocusWithin(cell(page, 11, 27));
        // no wait between the keys: the second reaches the cell the first moved to (AGENTS.md,
        // "Porting", 8)
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowDown");
        await expectFocusWithin(cell(page, 12, 11));
        await expect(grid(page, 2026, 12)).toBeVisible();
    });

    test("next month keeps focus on the button; outside-month days cannot be chosen", async ({
        page,
    }) => {
        const next = page.getByRole("button", { name: "Next month" });
        await next.click();
        await expect(grid(page, 2026, 12)).toBeVisible();
        await expect(next).toBeFocused();
        const outside = cell(page, 1, 2, 2027);
        await expect(outside).toHaveAttribute("aria-disabled", "true");
        await outside.click({ force: true });
        await expectOutput(page, "value", "none");
        await cell(page, 12, 3).click();
        await expectOutput(page, "value", "2026-12-03");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("calendar / min-max", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/calendar/min-max", { today: true });
    });

    test("dates outside the bounds are disabled and cannot be chosen", async ({
        page,
    }) => {
        await expect(cell(page, 11, 9)).toHaveAttribute(
            "aria-disabled",
            "true",
        );
        await cell(page, 11, 9).click({ force: true });
        await expectOutput(page, "value", "none");
        // a press never focuses a disabled date
        await expect(cell(page, 11, 9)).not.toBeFocused();
    });

    test("previous month is disabled at the lower bound, next at the upper bound", async ({
        page,
    }) => {
        await expect(
            page.getByRole("button", { name: "Previous month" }),
        ).toBeDisabled();
        const next = page.getByRole("button", { name: "Next month" });
        await expect(next).toBeEnabled();
        await next.click();
        await expect(grid(page, 2026, 12)).toBeVisible();
        await expect(next).toBeDisabled();
        await expect(cell(page, 12, 6)).toHaveAttribute(
            "aria-disabled",
            "true",
        );
    });

    test("the keyboard cannot move past the lower bound", async ({ page }) => {
        await cell(page, 11, 10).click();
        await expectFocusWithin(cell(page, 11, 10));
        await page.keyboard.press("ArrowLeft");
        await expectFocusWithin(cell(page, 11, 10));
    });
});

test("calendar / unavailable: weekends can be focused but not chosen", async ({
    page,
}) => {
    await openScenario(page, "/calendar/unavailable", { today: true });
    await expect(cell(page, 11, 21)).toHaveAttribute("aria-disabled", "true");
    await tabIntoGrid(page);
    await page.keyboard.press("ArrowRight");
    await expectFocusWithin(cell(page, 11, 21));
    await page.keyboard.press("Enter");
    await expectOutput(page, "value", "none");
});

test("calendar / unavailable: a click on an unavailable date leaves the page buttons their focus", async ({
    page,
}) => {
    await openScenario(page, "/calendar/unavailable", { today: true });
    // focusable, though `aria-disabled`: the press goes through
    await cell(page, 11, 21).click({ force: true });
    await expectFocusWithin(cell(page, 11, 21));
    const next = page.getByRole("button", { name: "Next month" });
    await next.click();
    await expect(grid(page, 2026, 12)).toBeVisible();
    await expect(next).toBeFocused();
});

test("calendar / locale de-DE: German weekday headers, Monday first", async ({
    page,
}) => {
    await openScenario(page, "/calendar/locale", {
        locale: "de-DE",
        today: true,
    });
    await expect(page.getByRole("columnheader").first()).toHaveText(
        shortWeekday("de-DE", 2026, 11, 16),
    );
});

test.describe("calendar / single, no locale and no lang", () => {
    test.use({ locale: "de-DE" });

    test("takes the browser's language once mounted", async ({ page }) => {
        await openScenario(page, "/calendar/single", {
            locale: "none",
            today: true,
        });
        expect(
            await page.evaluate(() =>
                document.documentElement.hasAttribute("lang"),
            ),
        ).toBe(false);
        await expect(page.getByRole("columnheader").first()).toHaveText(
            shortWeekday("de-DE", 2026, 11, 16),
        );
        await expect(grid(page, 2026, 11, "de-DE")).toBeVisible();
    });

    // Epic #49 (#46): the document's language is followed after mount, not read once
    test("follows a change of the document's language after mount", async ({
        page,
    }) => {
        await openScenario(page, "/calendar/single", {
            locale: "none",
            today: true,
        });
        await expect(grid(page, 2026, 11, "de-DE")).toBeVisible();
        await page.evaluate(() => {
            document.documentElement.lang = "fr-FR";
        });
        await expect(grid(page, 2026, 11, "fr-FR")).toBeVisible();
        await expect(page.getByRole("columnheader").first()).toHaveText(
            shortWeekday("fr-FR", 2026, 11, 16),
        );
    });

    test("a picker's calendar keeps the focus it took when it switches language", async ({
        page,
    }) => {
        await openScenario(page, "/date-picker/basic", {
            locale: "none",
            today: true,
        });
        await page.getByRole("button", { name: "Choose date" }).click();
        await expect(grid(page, 2026, 11, "de-DE")).toBeVisible();
        await expectFocusWithin(cell(page, 11, 20, 2026, "de-DE"));
    });
});

test("calendar / locale de-DE: German names, Monday first", async ({
    page,
}) => {
    await openScenario(page, "/calendar/locale", {
        locale: "de-DE",
        today: true,
    });
    await expect(grid(page, 2026, 11, "de-DE")).toBeVisible();
    const firstCell = page.getByRole("gridcell").first();
    await expect(firstCell).toHaveAccessibleName(
        new RegExp(fullDate("de-DE", 2026, 10, 26)),
    );
    await tabIntoGrid(page);
    await expectFocusWithin(cell(page, 11, 20, 2026, "de-DE"));
});

test("calendar / locale de-DE: Home goes to Monday", async ({ page }) => {
    await openScenario(page, "/calendar/locale", {
        locale: "de-DE",
        today: true,
    });
    await tabIntoGrid(page);
    await expectFocusWithin(cell(page, 11, 20, 2026, "de-DE"));
    await page.keyboard.press("Home");
    await expectFocusWithin(cell(page, 11, 16, 2026, "de-DE"));
});

test("calendar / rtl he-IL: ArrowLeft is the next day", async ({ page }) => {
    await openScenario(page, "/calendar/rtl", {
        locale: "he-IL",
        dir: "rtl",
        today: true,
    });
    await tabIntoGrid(page);
    await expectFocusWithin(cell(page, 11, 20, 2026, "he-IL"));
    await page.keyboard.press("ArrowLeft");
    await expectFocusWithin(cell(page, 11, 21, 2026, "he-IL"));
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expectFocusWithin(cell(page, 11, 19, 2026, "he-IL"));
});

test("calendar / two-months: two named grids; arrows cross them; next pages by two", async ({
    page,
}) => {
    await openScenario(page, "/calendar/two-months", { today: true });
    await expect(grid(page, 2026, 11)).toBeVisible();
    await expect(grid(page, 2026, 12)).toBeVisible();
    await grid(page, 2026, 11)
        .getByRole("gridcell", { name: fullDate("en-US", 2026, 11, 30) })
        .click();
    await page.keyboard.press("ArrowRight");
    await expectFocusWithin(
        grid(page, 2026, 12).getByRole("gridcell", {
            name: fullDate("en-US", 2026, 12, 1),
        }),
    );
    await expect(grid(page, 2026, 11)).toBeVisible();
    await page.getByRole("button", { name: "Next month" }).click();
    await expect(grid(page, 2027, 1)).toBeVisible();
    await expect(grid(page, 2027, 2)).toBeVisible();
});

test.describe("calendar / range", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/calendar/range", { today: true });
    });

    test("two clicks choose a range", async ({ page }) => {
        await expect(page.getByRole("grid")).toHaveAttribute(
            "aria-multiselectable",
            "true",
        );
        await cell(page, 11, 10).click();
        await cell(page, 11, 15).click();
        await expectOutput(page, "value", "2026-11-10..2026-11-15");
        for (const day of [10, 12, 15]) {
            await expect(cell(page, 11, day)).toHaveAttribute(
                "aria-selected",
                "true",
            );
        }
    });

    test("an end before the start swaps them", async ({ page }) => {
        await cell(page, 11, 18).click();
        await cell(page, 11, 12).click();
        await expectOutput(page, "value", "2026-11-12..2026-11-18");
    });

    test("the keyboard chooses a range", async ({ page }) => {
        await tabIntoGrid(page);
        await expectFocusWithin(cell(page, 11, 20));
        await page.keyboard.press("Enter");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "2026-11-20..2026-11-22");
    });

    test("Escape cancels a started range", async ({ page }) => {
        await cell(page, 11, 24).click();
        await page.keyboard.press("Escape");
        await cell(page, 11, 26).click();
        await expectOutput(page, "value", "none");
    });
});

test.describe("date-picker / basic", () => {
    const trigger = (page: Page) =>
        page.getByRole("button", { name: "Choose date" });

    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/date-picker/basic", { today: true });
    });

    test("the trigger opens a dialog focused on today", async ({ page }) => {
        await expect(trigger(page)).toHaveAttribute("aria-haspopup", "dialog");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
        await trigger(page).click();
        await expect(
            page.getByRole("dialog", { name: "Choose date", exact: true }),
        ).toBeVisible();
        await expect(page.getByRole("dialog")).not.toHaveAttribute(
            "aria-modal",
        );
        await expect(grid(page, 2026, 11)).toBeVisible();
        await expectFocusWithin(cell(page, 11, 20));
    });

    test("choosing a date closes and focuses the trigger; reopening focuses the value", async ({
        page,
    }) => {
        await trigger(page).click();
        await expectFocusWithin(cell(page, 11, 20));
        for (let index = 0; index < 4; index++) {
            await page.keyboard.press("ArrowRight");
        }
        await expectFocusWithin(cell(page, 11, 24));
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "2026-11-24");
        await expect(page.getByRole("dialog")).toBeHidden();
        await expectOutput(page, "reason", "item-press");
        await expect(trigger(page)).toBeFocused();
        await trigger(page).click();
        await expectFocusWithin(cell(page, 11, 24));
    });

    test("reopened right after a choice, it focuses the chosen date", async ({
        page,
    }) => {
        await trigger(page).click();
        await cell(page, 11, 24).click();
        await expectOutput(page, "value", "2026-11-24");
        await expect(trigger(page)).toBeFocused();
        // no wait for the exit animation: the popup may still be mounted when it reopens
        await trigger(page).click();
        await expectFocusWithin(cell(page, 11, 24));
        await expect(cell(page, 11, 24)).toHaveAttribute(
            "aria-selected",
            "true",
        );
    });

    test("reopened right after Escape, it focuses the value again, not the date it moved to", async ({
        page,
    }) => {
        await trigger(page).click();
        await expectFocusWithin(cell(page, 11, 20));
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await expectFocusWithin(cell(page, 11, 22));
        await page.keyboard.press("Escape");
        await trigger(page).click();
        await expectFocusWithin(cell(page, 11, 20));
    });

    test("Escape closes and focuses the trigger", async ({ page }) => {
        await trigger(page).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog")).toBeHidden();
        await expectOutput(page, "reason", "escape-key");
        await expect(trigger(page)).toBeFocused();
    });

    test("an outside press on nothing focusable closes and returns focus to the trigger", async ({
        page,
    }) => {
        await trigger(page).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await page.getByTestId("output").click();
        await expect(page.getByRole("dialog")).toBeHidden();
        await expectOutput(page, "reason", "outside-press");
        await expect(trigger(page)).toBeFocused();
    });

    test("Tab out of the popup closes it, as a popover", async ({ page }) => {
        await trigger(page).click();
        await expectFocusWithin(cell(page, 11, 20));
        await page.keyboard.press("Tab");
        await expect(page.getByRole("dialog")).toBeHidden();
        await expectOutput(page, "reason", "focus-out");
        await trigger(page).click();
        await expectFocusWithin(cell(page, 11, 20));
        await page.keyboard.press("Shift+Tab");
        await expect(
            page.getByRole("button", { name: "Next month" }),
        ).toBeFocused();
        await page.keyboard.press("Shift+Tab");
        await expect(
            page.getByRole("button", { name: "Previous month" }),
        ).toBeFocused();
        await page.keyboard.press("Shift+Tab");
        await expect(page.getByRole("dialog")).toBeHidden();
        await expectOutput(page, "reason", "focus-out");
        await expect(trigger(page)).toBeFocused();
    });

    test("has no axe violation while open", async ({ page }) => {
        await trigger(page).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await expectNoAxeViolations(page);
    });
});

test("date-picker / range: closing cancels a started range", async ({
    page,
}) => {
    await openScenario(page, "/date-picker/range", { today: true });
    const trigger = page.getByRole("button", { name: "Choose dates" });
    await trigger.click();
    await cell(page, 11, 10).click();
    // closed by its trigger (Escape would cancel the range first, see below)
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeHidden();
    // reopened at once: the start on the 10th is gone, so the 13th starts a new range
    await trigger.click();
    await cell(page, 11, 13).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectOutput(page, "value", "none");
    await cell(page, 11, 15).click();
    await expectOutput(page, "value", "2026-11-13..2026-11-15");
});

test("date-picker / range: Escape cancels a started range first, then closes", async ({
    page,
}) => {
    await openScenario(page, "/date-picker/range", { today: true });
    const trigger = page.getByRole("button", { name: "Choose dates" });
    await trigger.click();
    await cell(page, 11, 10).click();
    await page.keyboard.press("Escape");
    // the range calendar takes the first Escape: the popup stays, and the start on the 10th is
    // gone (the 13th starts a new range instead of ending 10..13)
    await expect(page.getByRole("dialog")).toBeVisible();
    await cell(page, 11, 13).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectOutput(page, "value", "none");
    // the start on the 13th is cancelled by the next Escape, and the one after closes
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused();
});

test("date-picker / range: closes after the end date", async ({ page }) => {
    await openScenario(page, "/date-picker/range", { today: true });
    const trigger = page.getByRole("button", { name: "Choose dates" });
    await trigger.click();
    await expect(
        page.getByRole("dialog", { name: "Choose dates", exact: true }),
    ).toBeVisible();
    await cell(page, 11, 10).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await cell(page, 11, 13).click();
    await expectOutput(page, "value", "2026-11-10..2026-11-13");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused();
});

// Epic #49 (#46), spec/README.md "Forms": a bridge that focused its trigger keeps the focus, the
// browser does not move it on to a later invalid native control
test.describe("date-picker / mixed-form", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/date-picker/mixed-form", { today: true });
    });

    test("the first invalid picker keeps the focus; a later native control gets it next", async ({
        page,
    }) => {
        const arrival = page.getByRole("button", { name: /^Arrival: / });
        const guest = page.getByRole("textbox", { name: "Guest name" });
        const submit = page.getByRole("button", {
            name: "Submit",
            exact: true,
        });
        await submit.click();
        await expectOutput(page, "form", "none");
        await expect(arrival).toBeFocused();
        await expect(guest).not.toBeFocused();
        await arrival.click();
        await cell(page, 11, 24).click();
        await expect(arrival).toHaveText("Arrival: 2026-11-24");
        await submit.click();
        await expectOutput(page, "form", "none");
        await expect(guest).toBeFocused();
        await guest.fill("Ada");
        await submit.click();
        await expectOutput(page, "form", "arrival=2026-11-24&guest=Ada");
    });
});

test.describe("date-picker / form", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/date-picker/form", { today: true });
    });

    const picker = (page: Page, name: string) =>
        page.getByRole("button", { name: new RegExp(`^${name}: `) });
    const submit = (page: Page) =>
        page.getByRole("button", { name: "Submit", exact: true });

    test("required pickers block a submission and focus their trigger, then submit ISO values", async ({
        page,
    }) => {
        await submit(page).click();
        await expectOutput(page, "form", "none");
        await expect(picker(page, "Arrival")).toBeFocused();
        await picker(page, "Arrival").click();
        await cell(page, 11, 24).click();
        await expect(picker(page, "Arrival")).toHaveText("Arrival: 2026-11-24");
        await submit(page).click();
        await expectOutput(page, "form", "none");
        await expect(picker(page, "Stay")).toBeFocused();
        await picker(page, "Stay").click();
        await cell(page, 11, 25).click();
        await cell(page, 11, 27).click();
        await expect(picker(page, "Stay")).toHaveText(
            "Stay: 2026-11-25..2026-11-27",
        );
        await submit(page).click();
        await expectOutput(
            page,
            "form",
            "arrival=2026-11-24&stay=2026-11-25/2026-11-27&departure=2026-11-30",
        );
    });

    test("a read-only picker opens, but its value does not change", async ({
        page,
    }) => {
        const departure = picker(page, "Departure");
        await departure.click();
        await expect(
            page.getByRole("dialog", { name: "Departure date", exact: true }),
        ).toBeVisible();
        await cell(page, 11, 26).click();
        await expect(departure).toHaveText("Departure: 2026-11-30");
    });

    test("a disabled picker cannot open", async ({ page }) => {
        await expect(picker(page, "Return")).toBeDisabled();
    });

    test("a form reset returns the pickers to their default", async ({
        page,
    }) => {
        await picker(page, "Arrival").click();
        await cell(page, 11, 24).click();
        await expect(picker(page, "Arrival")).toHaveText("Arrival: 2026-11-24");
        await page.getByRole("button", { name: "Reset", exact: true }).click();
        await expect(picker(page, "Arrival")).toHaveText("Arrival: none");
        await expect(picker(page, "Stay")).toHaveText("Stay: none");
        await expect(picker(page, "Departure")).toHaveText(
            "Departure: 2026-11-30",
        );
        await submit(page).click();
        await expectOutput(page, "form", "none");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

// spec/calendar.md, `/date-picker/in-dialog`: every picker kind inside a modal Dialog, whose focus
// trap must leave the popup's calendar its focus (the popup is a layer of the dialog before its
// calendar takes the focus)
test.describe("date-picker / in-dialog", () => {
    const monthCell = (page: Page, month: number) =>
        page.getByRole("gridcell", {
            name: monthHeading("en-US", 2026, month),
            exact: true,
        });
    const yearCell = (page: Page, year: number) =>
        page.getByRole("gridcell", {
            name: yearName("en-US", year),
            exact: true,
        });
    const PICKERS: readonly {
        trigger: string | RegExp;
        popup: string;
        focused: (page: Page) => ReturnType<Page["getByRole"]>;
        next: (page: Page) => ReturnType<Page["getByRole"]>;
    }[] = [
        {
            trigger: "Date",
            popup: "Choose date",
            focused: (page) => cell(page, 11, 20),
            next: (page) => cell(page, 11, 21),
        },
        {
            trigger: "Dates",
            popup: "Choose dates",
            focused: (page) => cell(page, 11, 20),
            next: (page) => cell(page, 11, 21),
        },
        {
            trigger: /Choose arrival$/,
            popup: "Arrival date",
            focused: (page) => cell(page, 11, 20),
            next: (page) => cell(page, 11, 21),
        },
        {
            trigger: /Choose stay$/,
            popup: "Stay dates",
            focused: (page) => cell(page, 11, 20),
            next: (page) => cell(page, 11, 21),
        },
        {
            trigger: "Month",
            popup: "Choose month",
            focused: (page) => monthCell(page, 11),
            next: (page) => monthCell(page, 12),
        },
        {
            trigger: "Months",
            popup: "Choose months",
            focused: (page) => monthCell(page, 11),
            next: (page) => monthCell(page, 12),
        },
        {
            trigger: "Year",
            popup: "Choose year",
            focused: (page) => yearCell(page, 2026),
            next: (page) => yearCell(page, 2027),
        },
        {
            trigger: "Years",
            popup: "Choose years",
            focused: (page) => yearCell(page, 2026),
            next: (page) => yearCell(page, 2027),
        },
    ];

    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/date-picker/in-dialog", { today: true });
        await page.getByRole("button", { name: "Plan the trip" }).click();
        await expect(
            page.getByRole("dialog", { name: "Plan the trip" }),
        ).toBeVisible();
    });

    for (const picker of PICKERS) {
        test(`${picker.popup}: opening focuses the focused cell; Escape closes the popup, then the dialog`, async ({
            page,
        }) => {
            const dialog = page.getByRole("dialog", { name: "Plan the trip" });
            const trigger = dialog.getByRole("button", {
                name: picker.trigger,
                exact: typeof picker.trigger === "string",
            });
            await trigger.click();
            const popup = page.getByRole("dialog", { name: picker.popup });
            await expect(popup).toBeVisible();
            await expectFocusWithin(picker.focused(page));
            // the keys reach the grid, not the dialog
            await page.keyboard.press("ArrowRight");
            await expectFocusWithin(picker.next(page));
            await page.keyboard.press("Escape");
            await expect(popup).toBeHidden();
            await expect(dialog).toBeVisible();
            await expect(trigger).toBeFocused();
            await page.keyboard.press("Escape");
            await expect(dialog).toBeHidden();
            await expect(
                page.getByRole("button", { name: "Plan the trip" }),
            ).toBeFocused();
        });
    }

    test("Enter chooses the focused date: the popup closes, the dialog stays open", async ({
        page,
    }) => {
        const dialog = page.getByRole("dialog", { name: "Plan the trip" });
        const trigger = dialog.getByRole("button", {
            name: "Date",
            exact: true,
        });
        await trigger.click();
        await expectFocusWithin(cell(page, 11, 20));
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "2026-11-20");
        await expect(
            page.getByRole("dialog", { name: "Choose date" }),
        ).toBeHidden();
        await expect(dialog).toBeVisible();
        await expect(trigger).toBeFocused();
    });

    test("has no axe violation with a picker open in the dialog", async ({
        page,
    }) => {
        await page
            .getByRole("dialog", { name: "Plan the trip" })
            .getByRole("button", { name: "Date", exact: true })
            .click();
        await expectFocusWithin(cell(page, 11, 20));
        await expectNoAxeViolations(page);
    });
});
