import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { yearName } from "../../src/dates.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/month-calendar.md: the year calendars' parts
const cellOf = (
    page: import("@playwright/test").Page,
    component: string,
    year: number,
) =>
    page.locator(
        `[data-primitives-part="${component}-cell"][aria-label="${yearName("en-US", year)}"]`,
    );

test("year-calendar / basic: parts and 12 cells", async ({ page }) => {
    await openScenario(page, "/year-calendar/basic", { today: true });
    await expect(parts(page, "month-calendar")).toHaveCount(0);
    for (const name of ["root", "heading", "grid", "grid-body"]) {
        await expect(part(page, "year-calendar", name)).toHaveCount(1);
    }
    await expect(part(page, "year-calendar", "cell")).toHaveCount(12);
    await expect(cellOf(page, "year-calendar", 2026)).toHaveAttribute(
        "data-today",
        "",
    );
    await expectNoFalseStates(parts(page, "year-calendar"));
});

test("year-calendar / range: the range's ends", async ({ page }) => {
    await openScenario(page, "/year-calendar/range", { today: true });
    await cellOf(page, "year-range-calendar", 2024).click();
    await cellOf(page, "year-range-calendar", 2020).click();
    await expect(cellOf(page, "year-range-calendar", 2020)).toHaveAttribute(
        "data-range-start",
        "",
    );
    await expect(cellOf(page, "year-range-calendar", 2024)).toHaveAttribute(
        "data-range-end",
        "",
    );
    await expectNoFalseStates(parts(page, "year-range-calendar"));
});
