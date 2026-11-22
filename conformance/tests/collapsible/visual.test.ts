import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("collapsible / basic", async ({ page }) => {
    await openScenario(page, "/collapsible/basic");
    await expect(page.getByText("gamma-9012")).toBeVisible();
    await expectScreen(page, "collapsible-basic");
});

test("collapsible / basic: open", async ({ page }) => {
    await openScenario(page, "/collapsible/basic");
    await page.getByRole("button", { name: "Recovery keys" }).click();
    await expect(page.getByText("alpha-1234")).toBeVisible();
    await expectScreen(page, "collapsible-basic-open");
});
