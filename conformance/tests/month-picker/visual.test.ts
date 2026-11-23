import { test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("month-picker / form: open", async ({ page }) => {
    await openScenario(page, "/month-picker/form", { today: true });
    await page.getByRole("button", { name: /^Expiry: / }).click();
    await page.getByRole("dialog").waitFor();
    await expectScreen(page, "month-picker-open");
});
