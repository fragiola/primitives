import { expect, test } from "@playwright/test";
import { SYSTEM_LOCALES, systemPath } from "../../src/calendar-systems.ts";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";

// spec/calendar-systems.md: a component in a calendar system keeps its parts and its ISO form
for (const { locale, rtl } of SYSTEM_LOCALES) {
    test(`${systemPath("basic", locale, rtl)}: the parts, and an ISO hidden input`, async ({
        page,
    }) => {
        await page.clock.setFixedTime(new Date(2026, 10, 20, 10, 0, 0));
        await page.goto(systemPath("basic", locale, rtl));
        await expect(part(page, "calendar", "root")).toHaveCount(1);
        await expect(part(page, "calendar", "grid")).toHaveCount(1);
        await expect(part(page, "date-field", "root")).toHaveCount(1);
        await expect(part(page, "date-field", "hidden-input")).toHaveValue(
            "2026-11-20",
        );
        await expect(part(page, "month-calendar", "grid")).toHaveCount(1);
        for (const component of ["calendar", "date-field", "month-calendar"]) {
            await expectNoFalseStates(parts(page, component));
        }
    });

    test(`${systemPath("pickers", locale, rtl)}: the pickers' parts and form inputs`, async ({
        page,
    }) => {
        await page.clock.setFixedTime(new Date(2026, 10, 20, 10, 0, 0));
        await page.goto(systemPath("pickers", locale, rtl));
        await expect(part(page, "date-picker", "input")).toHaveValue(
            "2026-11-20",
        );
        await expect(part(page, "date-range-picker", "input")).toHaveAttribute(
            "name",
            "stay",
        );
        await expect(part(page, "month-picker", "input")).toHaveAttribute(
            "name",
            "month",
        );
        await expect(part(page, "year-picker", "input")).toHaveAttribute(
            "name",
            "year",
        );
        await part(page, "month-picker", "trigger").click();
        await expect(
            part(page, "month-calendar", "cell").first(),
        ).toBeVisible();
        await expectNoFalseStates(parts(page, "month-calendar"));
    });
}
