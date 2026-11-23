import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("search-field / basic: empty and with a query", async ({ page }) => {
    await openScenario(page, "/search-field/basic");
    await expectScreen(page, "search-field-basic-empty");
    const input = page.getByRole("searchbox", { name: "Search" });
    await input.fill("lamp");
    await expect(input).toHaveValue("lamp");
    await expectScreen(page, "search-field-basic-query");
});

test("search-field / states: disabled and read-only", async ({ page }) => {
    await openScenario(page, "/search-field/states");
    await expectScreen(page, "search-field-states");
});
