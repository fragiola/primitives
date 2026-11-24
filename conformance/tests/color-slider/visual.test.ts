import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("color-slider / basic", async ({ page }) => {
    await openScenario(page, "/color-slider/basic");
    await expect(page.getByRole("slider", { name: "Hue" })).toBeVisible();
    await expectScreen(page, "color-slider-basic");
});

test("color-slider / alpha", async ({ page }) => {
    await openScenario(page, "/color-slider/alpha");
    await expect(page.getByRole("slider", { name: "Opacity" })).toBeVisible();
    await expectScreen(page, "color-slider-alpha");
});

test("color-slider / vertical", async ({ page }) => {
    await openScenario(page, "/color-slider/vertical");
    await expect(
        page.getByRole("slider", { name: "Brightness" }),
    ).toBeVisible();
    await expectScreen(page, "color-slider-vertical");
});

test("color-slider / space", async ({ page }) => {
    await openScenario(page, "/color-slider/space");
    await expect(page.getByRole("slider")).toHaveCount(3);
    await expectScreen(page, "color-slider-space");
});
