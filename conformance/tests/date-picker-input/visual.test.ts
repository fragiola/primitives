import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { typeKeys } from "../../src/segments.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("date-picker-input / basic: filled", async ({ page }) => {
    await openScenario(page, "/date-picker-input/basic", { today: true });
    await page.getByRole("spinbutton").first().focus();
    await typeKeys(page, "11242026");
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expect(page.getByTestId("output")).toContainText("2026-11-24");
    await expectScreen(page, "date-picker-input-basic");
});

test("date-picker-input / range: filled", async ({ page }) => {
    await openScenario(page, "/date-picker-input/range", { today: true });
    await page.getByRole("spinbutton").first().focus();
    await typeKeys(page, "1123202611272026");
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expect(page.getByTestId("output")).toContainText(
        "2026-11-23..2026-11-27",
    );
    await expectScreen(page, "date-picker-input-range");
});
