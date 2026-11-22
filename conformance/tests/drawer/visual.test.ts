import { expect, test } from "@playwright/test";
import { settleAnimations } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

// One golden set for every framework, made by React in CI (AGENTS.md rule 5)
test.beforeEach(visualOnlyInCi);

test("drawer / basic: open", async ({ page }) => {
    await openScenario(page, "/drawer/basic");
    await page.getByRole("button", { name: "Open drawer" }).click();
    await expect(
        page.getByRole("dialog", { name: "Notifications" }),
    ).toBeVisible();
    await settleAnimations(page);
    await expectScreen(page, "drawer-basic-open");
});

test("drawer / side: open", async ({ page }) => {
    await openScenario(page, "/drawer/side");
    await page.getByRole("button", { name: "Open settings" }).click();
    await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
    await settleAnimations(page);
    await expectScreen(page, "drawer-side-open");
});

test("drawer / snap-points: on its first snap point", async ({ page }) => {
    await openScenario(page, "/drawer/snap-points");
    await page.getByRole("button", { name: "Open map" }).click();
    await expect(page.getByRole("dialog", { name: "Map" })).toBeVisible();
    await settleAnimations(page);
    await expectScreen(page, "drawer-snap-points-open");
});

test("drawer / nested: both open", async ({ page }) => {
    await openScenario(page, "/drawer/nested");
    await page.getByRole("button", { name: "Open order" }).click();
    await page.getByRole("button", { name: "Edit address" }).click();
    await expect(page.getByRole("dialog", { name: "Address" })).toBeVisible();
    await settleAnimations(page);
    await expectScreen(page, "drawer-nested-open");
});
