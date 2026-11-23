import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("color-area / basic", async ({ page }) => {
    await openScenario(page, "/color-area/basic");
    await expect(page.getByRole("slider")).toHaveCount(2);
    await expectScreen(page, "color-area-basic");
});

test("color-area / rgb", async ({ page }) => {
    await openScenario(page, "/color-area/rgb");
    await expect(page.getByRole("slider")).toHaveCount(2);
    await expectScreen(page, "color-area-rgb");
});
