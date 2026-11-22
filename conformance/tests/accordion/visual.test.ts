import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("accordion / basic: one item expanded", async ({ page }) => {
    await openScenario(page, "/accordion/basic");
    await page.getByRole("button", { name: "Returns" }).click();
    await expect(page.getByText("Returns details")).toBeVisible();
    await expectScreen(page, "accordion-basic");
});

test("accordion / multiple", async ({ page }) => {
    await openScenario(page, "/accordion/multiple");
    await expect(page.getByText("Shipping details")).toBeVisible();
    await expectScreen(page, "accordion-multiple");
});

test("accordion / horizontal", async ({ page }) => {
    await openScenario(page, "/accordion/horizontal");
    await expectScreen(page, "accordion-horizontal");
});
