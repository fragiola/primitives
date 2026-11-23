import { test } from "@playwright/test";
import { fullDate } from "../../src/dates.ts";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("multiple-calendar / basic: three chosen dates", async ({ page }) => {
    await openScenario(page, "/multiple-calendar/basic", { today: true });
    for (const day of [3, 10, 24]) {
        await page
            .getByRole("gridcell", { name: fullDate("en-US", 2026, 11, day) })
            .click();
    }
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expectScreen(page, "multiple-calendar-basic");
});
