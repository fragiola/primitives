import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("autocomplete / basic: open with a highlight", async ({ page }) => {
    await openScenario(page, "/autocomplete/basic");
    await page.getByRole("combobox", { name: "Search" }).click();
    await page.keyboard.type("b");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("option")).toHaveCount(2);
    await expectScreen(page, "autocomplete-basic-open");
});

test("autocomplete / both: the inline completion", async ({ page }) => {
    await openScenario(page, "/autocomplete/both");
    await page.getByRole("combobox", { name: "Fruit" }).click();
    await page.keyboard.type("b");
    await expect(page.getByRole("combobox", { name: "Fruit" })).toHaveValue(
        "Banana",
    );
    await expectScreen(page, "autocomplete-both-completed");
});

test("autocomplete / groups: grouped suggestions", async ({ page }) => {
    await openScenario(page, "/autocomplete/groups");
    await page.getByRole("combobox", { name: "Produce" }).click();
    await page.keyboard.type("c");
    await expect(page.getByRole("group")).toHaveCount(2);
    await expectScreen(page, "autocomplete-groups");
});

test("autocomplete / field: invalid", async ({ page }) => {
    await openScenario(page, "/autocomplete/field");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Enter a city.")).toBeVisible();
    await expectScreen(page, "autocomplete-field-invalid");
});
