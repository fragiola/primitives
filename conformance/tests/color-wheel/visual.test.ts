import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("color-wheel / basic", async ({ page }) => {
    await openScenario(page, "/color-wheel/basic");
    await expect(page.getByRole("slider", { name: "Hue" })).toBeVisible();
    await expectScreen(page, "color-wheel-basic");
});
