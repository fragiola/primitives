import { test } from "@playwright/test";
import { yearName } from "../../src/dates.ts";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("year-calendar / basic: today and the bounds", async ({ page }) => {
    await openScenario(page, "/year-calendar/basic", { today: true });
    await page.getByRole("gridcell", { name: yearName("en-US", 2020) }).click();
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expectScreen(page, "year-calendar-basic");
});
