import { expect, test } from "@playwright/test";
import { expectOutput } from "../../src/output.ts";
import { settleAnimations } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

// One golden set for every framework, made by React in CI (AGENTS.md rule 5)
test.beforeEach(visualOnlyInCi);

test("navigation-menu / basic: Products open", async ({ page }) => {
    await openScenario(page, "/navigation-menu/basic");
    await page.getByRole("button", { name: "Products" }).click();
    await expect(page.getByRole("link", { name: "Analytics" })).toBeVisible();
    await settleAnimations(page);
    await expectScreen(page, "navigation-menu-basic-open");
});

test("navigation-menu / basic: Learn open", async ({ page }) => {
    await openScenario(page, "/navigation-menu/basic");
    await page.getByRole("button", { name: "Learn" }).click();
    await expect(page.getByRole("link", { name: "Guides" })).toBeVisible();
    await settleAnimations(page);
    await expectScreen(page, "navigation-menu-basic-learn");
});

test("navigation-menu / nested: both levels open", async ({ page }) => {
    await openScenario(page, "/navigation-menu/nested");
    await page.getByRole("button", { name: "Products" }).click();
    await page.getByRole("button", { name: "Developers" }).click();
    await expectOutput(page, "nested", "developers");
    await expect(page.getByRole("link", { name: "API" })).toBeVisible();
    await settleAnimations(page);
    await expectScreen(page, "navigation-menu-nested-open");
});
