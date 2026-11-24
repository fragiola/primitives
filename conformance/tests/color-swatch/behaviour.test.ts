import { expect, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/color-swatch.md
test("color-swatch / basic: images named by the app, else by the color's CSS text", async ({
    page,
}) => {
    await openScenario(page, "/color-swatch/basic");
    const images = page.getByRole("img");
    await expect(images).toHaveCount(3);
    await expect(images.nth(0)).toHaveAccessibleName("Ocean");
    await expect(images.nth(1)).toHaveAccessibleName("rgba(255, 0, 0, 0.5)");
    await expect(images.nth(2)).toHaveAccessibleName("Forest");
    await expectNoAxeViolations(page);
});
