import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("number-field / basic", async ({ page }) => {
    await openScenario(page, "/number-field/basic");
    await expect(
        page.getByRole("spinbutton", { name: "Quantity" }),
    ).toHaveValue("1");
    await expectScreen(page, "number-field-basic");
});

test("number-field / format?locale=ar-EG&dir=rtl", async ({ page }) => {
    await openScenario(page, "/number-field/format", {
        locale: "ar-EG",
        dir: "rtl",
    });
    await expect(page.getByRole("spinbutton", { name: "Price" })).toBeVisible();
    await expectScreen(page, "number-field-format-ar-rtl");
});

test("number-field / field: invalid", async ({ page }) => {
    await openScenario(page, "/number-field/field");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Enter between 1 and 8 guests.")).toBeVisible();
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expectScreen(page, "number-field-field-invalid");
});
