import { test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("calendar-preset / basic: a date and a range set by presets", async ({
    page,
}) => {
    await openScenario(page, "/calendar-preset/basic", { today: true });
    await page.getByRole("button", { name: "Today" }).click();
    await page.getByRole("button", { name: "Last 7 days" }).click();
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expectScreen(page, "calendar-preset-basic");
});
