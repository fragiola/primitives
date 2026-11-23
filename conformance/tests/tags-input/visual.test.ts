import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("tags-input / basic: a tag focused", async ({ page }) => {
    await openScenario(page, "/tags-input/basic");
    await page.getByRole("textbox", { name: "Tags", exact: true }).click();
    await page.keyboard.press("Backspace");
    await expect(
        page.getByText("vue", { exact: true }).locator(".."),
    ).toBeFocused();
    await expectScreen(page, "tags-input-basic-focused");
});

test("tags-input / edit: editing", async ({ page }) => {
    await openScenario(page, "/tags-input/edit");
    await page.getByText("two", { exact: true }).dblclick();
    await expect(
        page.getByRole("textbox", { name: "Edit tag", exact: true }),
    ).toBeFocused();
    await expectScreen(page, "tags-input-edit");
});

test("tags-input / field: invalid", async ({ page }) => {
    await openScenario(page, "/tags-input/field");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Add at least one tag.")).toBeVisible();
    await expectScreen(page, "tags-input-field-invalid");
});
