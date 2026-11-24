import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";
import { stubEyeDropper } from "./eye-dropper.ts";

test.beforeEach(visualOnlyInCi);

test("color-picker / basic", async ({ page }) => {
    await stubEyeDropper(page, "#336699");
    await openScenario(page, "/color-picker/basic");
    await expect(
        page.getByRole("button", { name: "Pick a color" }),
    ).toBeVisible();
    await expectScreen(page, "color-picker-basic");
});

test("color-picker / popover, open", async ({ page }) => {
    await openScenario(page, "/color-picker/popover");
    await page
        .getByRole("button", { name: "Accent color", exact: true })
        .click();
    await expect(
        page.getByRole("dialog", { name: "Accent color picker" }),
    ).toBeVisible();
    await expectScreen(page, "color-picker-popover");
});
