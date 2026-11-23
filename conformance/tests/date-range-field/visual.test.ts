import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { typeKeys } from "../../src/segments.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("date-range-field / basic: filled", async ({ page }) => {
    await openScenario(page, "/date-range-field/basic", { today: true });
    await page.getByRole("spinbutton").first().focus();
    await typeKeys(page, "1123202611272026");
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expect(page.getByTestId("output")).toContainText(
        "2026-11-23..2026-11-27",
    );
    await expectScreen(page, "date-range-field-basic");
});
