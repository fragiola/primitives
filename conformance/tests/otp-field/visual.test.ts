import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("otp-field / basic", async ({ page }) => {
    await openScenario(page, "/otp-field/basic");
    await expect(
        page.getByLabel("Backup digit 1 of 4", { exact: true }),
    ).toHaveValue("2");
    await expectScreen(page, "otp-field-basic");
});

test("otp-field / basic?dir=rtl: a partial code", async ({ page }) => {
    await openScenario(page, "/otp-field/basic", { dir: "rtl" });
    await page.getByLabel("Digit 1 of 6", { exact: true }).focus();
    await page.keyboard.type("123");
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expectScreen(page, "otp-field-basic-rtl");
});

test("otp-field / field: invalid", async ({ page }) => {
    await openScenario(page, "/otp-field/field");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Enter the 4-character code.")).toBeVisible();
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expectScreen(page, "otp-field-field-invalid");
});
