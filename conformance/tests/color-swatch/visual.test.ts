import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("color-swatch / basic", async ({ page }) => {
    await openScenario(page, "/color-swatch/basic");
    await expect(page.getByRole("img")).toHaveCount(3);
    await expectScreen(page, "color-swatch-basic");
});
