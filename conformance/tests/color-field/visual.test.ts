import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("color-field / basic", async ({ page }) => {
    await openScenario(page, "/color-field/basic");
    await expect(page.getByRole("textbox", { name: "Color" })).toBeVisible();
    await expectScreen(page, "color-field-basic");
});

test("color-field / channel", async ({ page }) => {
    await openScenario(page, "/color-field/channel");
    await expect(page.getByRole("spinbutton", { name: "Hue" })).toBeVisible();
    await expectScreen(page, "color-field-channel");
});
