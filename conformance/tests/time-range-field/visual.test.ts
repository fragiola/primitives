import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { dayPeriods, typeKeys } from "../../src/segments.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("time-range-field / basic: filled", async ({ page }) => {
    await openScenario(page, "/time-range-field/basic", { today: true });
    const [am, pm] = await dayPeriods(page, "en-US");
    await page.getByRole("spinbutton").first().focus();
    await typeKeys(page, "900");
    await page.keyboard.press(am.charAt(0).toLowerCase());
    await typeKeys(page, "500");
    await page.keyboard.press(pm.charAt(0).toLowerCase());
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expect(page.getByTestId("output")).toContainText("09:00..17:00");
    await expectScreen(page, "time-range-field-basic");
});
