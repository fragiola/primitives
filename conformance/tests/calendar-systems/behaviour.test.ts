import { expect, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import {
    SYSTEM_LOCALES,
    systemFacts,
    systemPath,
} from "../../src/calendar-systems.ts";
import { expectFocusWithin } from "../../src/focus.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { fieldGroup, segment } from "../../src/segments.ts";

// spec/calendar-systems.md: the date components in five calendar systems. Today is fixed at
// 2026-11-20; every expected name, month length and month start is computed in the browser.

const pad = (value: number) => String(value).padStart(2, "0");

for (const { locale, rtl } of SYSTEM_LOCALES) {
    test.describe(systemPath("basic", locale, rtl), () => {
        test.beforeEach(async ({ page }) => {
            await page.clock.setFixedTime(new Date(2026, 10, 20, 10, 0, 0));
            await page.goto(systemPath("basic", locale, rtl));
        });

        test("the day calendar shows and moves through the system's months", async ({
            page,
        }) => {
            const facts = await systemFacts(page, locale);
            const grid = page
                .locator('[data-primitives-part="calendar-grid"]')
                .first();
            await expect(grid).toHaveAccessibleName(facts.heading);
            const selected = grid.locator('[aria-selected="true"]');
            await expect(selected).toHaveAccessibleName(facts.fullDate);
            await expect(selected).toHaveText(facts.dayText);
            // the enabled cells are the system's month (the others are outside it)
            await expect(grid.locator("td[tabindex]")).toHaveCount(
                facts.monthDays,
            );
            await selected.focus();
            await page.keyboard.press("PageDown");
            await expect(grid).toHaveAccessibleName(facts.nextMonthHeading);
            await expectFocusWithin(
                grid.getByRole("gridcell", {
                    name: facts.nextMonthDayName,
                    exact: true,
                }),
            );
            await page.keyboard.press("Enter");
            await expectOutput(page, "date", facts.nextMonthDay);
        });

        test("the date field edits the system's fields, its value ISO", async ({
            page,
        }) => {
            const facts = await systemFacts(page, locale);
            const group = fieldGroup(page, "Date");
            for (const type of ["year", "month", "day"] as const) {
                await expect(segment(group, type)).toHaveText(
                    facts.parts[type] ?? "",
                );
            }
            await expect(segment(group, "month")).toHaveAttribute(
                "aria-valuemax",
                String(facts.monthsInYear),
            );
            await expect(segment(group, "day")).toHaveAttribute(
                "aria-valuemax",
                String(facts.monthDays),
            );
            if (facts.id === "japanese") {
                // several eras: the era is a spinbutton; Heisei 8 is 1996
                const era = segment(group, "era");
                await expect(era).toHaveText(facts.parts.era ?? "");
                await era.focus();
                await page.keyboard.press("ArrowDown");
                await expectOutput(page, "field", "1996-11-20");
                await page.keyboard.press("ArrowUp");
                await expectOutput(page, "field", "2026-11-20");
            } else {
                await expect(segment(group, "era")).toHaveCount(0);
            }
            await segment(group, "day").focus();
            await page.keyboard.press("ArrowUp");
            await expectOutput(page, "field", "2026-11-21");
        });

        test("the month calendar's items are the system's months", async ({
            page,
        }) => {
            const facts = await systemFacts(page, locale);
            const grid = page.locator(
                '[data-primitives-part="month-calendar-grid"]',
            );
            await expect(grid).toHaveAccessibleName(facts.yearHeading);
            await expect(grid.getByRole("gridcell")).toHaveCount(
                facts.monthsInYear,
            );
            const selected = grid.locator('[aria-selected="true"]');
            await expect(selected).toHaveAccessibleName(facts.monthName);
            await selected.focus();
            // the next month in reading order: ArrowLeft in a right-to-left page
            await page.keyboard.press(rtl ? "ArrowLeft" : "ArrowRight");
            await page.keyboard.press("Enter");
            await expectOutput(
                page,
                "month",
                `${facts.nextFields.year}-${pad(facts.nextFields.month)}`,
            );
        });

        test("axe", async ({ page }) => {
            await expectNoAxeViolations(page);
        });
    });

    test.describe(systemPath("pickers", locale, rtl), () => {
        test.beforeEach(async ({ page }) => {
            await page.clock.setFixedTime(new Date(2026, 10, 20, 10, 0, 0));
            await page.goto(systemPath("pickers", locale, rtl));
        });

        test("the pickers choose in the system, the form submits ISO", async ({
            page,
        }) => {
            const facts = await systemFacts(page, locale);
            // the typed picker: its calendar opens on the system's month
            await page
                .getByRole("button", { name: "Date Choose date" })
                .click();
            const dialog = page.getByRole("dialog");
            await expect(dialog.getByRole("grid")).toHaveAccessibleName(
                facts.heading,
            );
            await expectFocusWithin(
                dialog.getByRole("gridcell", {
                    name: facts.fullDate,
                    exact: true,
                }),
            );
            await page.keyboard.press("PageDown");
            await page.keyboard.press("Enter");
            await expect(page.getByRole("dialog")).toHaveCount(0);
            const chosen = await page.evaluate(
                ({ locale, iso }) =>
                    Object.fromEntries(
                        new Intl.DateTimeFormat(locale, {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                            timeZone: "UTC",
                        })
                            .formatToParts(new Date(`${iso}T00:00:00Z`))
                            .map((part) => [part.type, part.value]),
                    ),
                { locale, iso: facts.nextMonthDay },
            );
            const group = fieldGroup(page, "Date");
            await expect(segment(group, "day")).toHaveText(chosen.day ?? "");
            await expect(segment(group, "month")).toHaveText(
                chosen.month ?? "",
            );

            // the range picker: the RangeCalendar inside it is the system's
            await page.getByRole("button", { name: "Stay" }).click();
            await expect(
                page.getByRole("dialog").getByRole("grid"),
            ).toHaveAccessibleName(facts.heading);
            await page.keyboard.press("Enter");
            for (let step = 0; step < 3; step++) {
                await page.keyboard.press(rtl ? "ArrowLeft" : "ArrowRight");
            }
            await page.keyboard.press("Enter");
            await expect(page.getByRole("dialog")).toHaveCount(0);

            // the month and year pickers: the system's month and year
            await page.getByRole("button", { name: "Month" }).click();
            await expectFocusWithin(
                page.getByRole("dialog").getByRole("gridcell", {
                    name: facts.monthName,
                    exact: true,
                }),
            );
            await page.keyboard.press("Enter");
            await expect(page.getByRole("dialog")).toHaveCount(0);
            await page.getByRole("button", { name: "Year" }).click();
            await expect(
                page.getByRole("dialog").locator('[tabindex="0"]'),
            ).toBeFocused();
            await page.keyboard.press("Enter");
            await expect(page.getByRole("dialog")).toHaveCount(0);

            await page.getByRole("button", { name: "Submit" }).click();
            await expectSubmitted(
                page,
                `date=${facts.nextMonthDay}&stay=2026-11-20/2026-11-23&month=${facts.monthStart}[u-ca=${facts.id}]&year=${facts.yearStart}[u-ca=${facts.id}]`,
            );
        });

        test("axe, the popup open and closed", async ({ page }) => {
            await expectNoAxeViolations(page);
            await page
                .getByRole("button", { name: "Date Choose date" })
                .click();
            await expect(page.getByRole("dialog")).toBeVisible();
            await expectNoAxeViolations(page);
        });
    });
}
