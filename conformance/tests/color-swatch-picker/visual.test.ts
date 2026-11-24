import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("color-swatch-picker / basic, with a selected and a focused option", async ({
    page,
}) => {
    await openScenario(page, "/color-swatch-picker/basic");
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("option", { name: "Blue" })).toBeFocused();
    await expectScreen(page, "color-swatch-picker-basic");
});
