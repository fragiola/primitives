import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("field / basic", async ({ page }) => {
    await openScenario(page, "/field/basic");
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expectScreen(page, "field-basic");
});

test("field / basic: invalid", async ({ page }) => {
    await openScenario(page, "/field/basic");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Enter your email.")).toBeVisible();
    await page.getByRole("textbox", { name: "Email" }).blur();
    await expectScreen(page, "field-basic-invalid");
});

test("field / validation: errors", async ({ page }) => {
    await openScenario(page, "/field/validation");
    await page.getByRole("textbox", { name: "Username" }).fill("a");
    await page.getByRole("textbox", { name: "Password" }).fill("abc");
    await page.getByRole("textbox", { name: "Password" }).blur();
    await expect(page.getByRole("listitem")).toHaveCount(2);
    await expectScreen(page, "field-validation-errors");
});

test("field / controls: invalid", async ({ page }) => {
    await openScenario(page, "/field/controls");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Choose a fruit.")).toBeVisible();
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expectScreen(page, "field-controls-invalid");
});

test("field / async: taken", async ({ page }) => {
    await openScenario(page, "/field/async");
    await page.getByRole("textbox", { name: "Username" }).fill("ada");
    await expect(page.getByText("This username is taken.")).toBeVisible();
    await page.getByRole("textbox", { name: "Username" }).blur();
    await expectScreen(page, "field-async-taken");
});

test("field / match: out of range", async ({ page }) => {
    await openScenario(page, "/field/match");
    await page.getByRole("spinbutton", { name: "Age" }).fill("12");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Enter an age from 18 to 120.")).toBeVisible();
    await page.getByRole("spinbutton", { name: "Age" }).blur();
    await expectScreen(page, "field-match-range");
});

test("field / more-controls: invalid", async ({ page }) => {
    await openScenario(page, "/field/more-controls", { today: true });
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Choose your dates.")).toBeVisible();
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expectScreen(page, "field-more-controls-invalid");
});

test("field / settings: invalid", async ({ page }) => {
    await openScenario(page, "/field/settings");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Choose how we reach you.")).toBeVisible();
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expectScreen(page, "field-settings-invalid");
});
