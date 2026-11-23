import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("password-input / basic: hidden and shown", async ({ page }) => {
    await openScenario(page, "/password-input/basic");
    const input = page.getByLabel("Password", { exact: true });
    await input.fill("hunter2");
    await expectScreen(page, "password-input-basic-hidden");
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(input).toHaveAttribute("type", "text");
    await expectScreen(page, "password-input-basic-shown");
});

test("password-input / field: invalid", async ({ page }) => {
    await openScenario(page, "/password-input/field");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(
        page.getByLabel("New password", { exact: true }),
    ).toHaveAttribute("aria-invalid", "true");
    await expectScreen(page, "password-input-field-invalid");
});
