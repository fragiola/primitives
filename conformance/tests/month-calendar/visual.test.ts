import { test } from "@playwright/test";
import { monthHeading } from "../../src/dates.ts";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

const month = (page: import("@playwright/test").Page, value: number) =>
    page.getByRole("gridcell", { name: monthHeading("en-US", 2026, value) });

test("month-calendar / basic: today, a chosen and an unavailable month", async ({
    page,
}) => {
    await openScenario(page, "/month-calendar/basic", { today: true });
    await month(page, 3).click();
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expectScreen(page, "month-calendar-basic");
});

test("month-calendar / range: a chosen range", async ({ page }) => {
    await openScenario(page, "/month-calendar/range", { today: true });
    await month(page, 3).click();
    await month(page, 6).click();
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expectScreen(page, "month-calendar-range");
});
