import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("steps / basic", async ({ page }) => {
    await openScenario(page, "/steps/basic");
    await expect(page.getByText("Shipping address")).toBeVisible();
    await expectScreen(page, "steps-basic");
});

test("steps / basic, on the second step", async ({ page }) => {
    await openScenario(page, "/steps/basic");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Payment method")).toBeVisible();
    await expectScreen(page, "steps-basic-second");
});

test("steps / linear", async ({ page }) => {
    await openScenario(page, "/steps/linear");
    await expect(page.getByRole("button", { name: "Next" })).toBeDisabled();
    await expectScreen(page, "steps-linear");
});
