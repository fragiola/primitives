import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("label / controls", async ({ page }) => {
    await openScenario(page, "/label/controls");
    await expect(page.getByRole("slider", { name: "Volume" })).toBeVisible();
    await expectScreen(page, "label-controls");
});
