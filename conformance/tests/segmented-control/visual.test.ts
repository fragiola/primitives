import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("segmented-control / basic: checked and focused", async ({ page }) => {
    await openScenario(page, "/segmented-control/basic");
    const grid = page.getByRole("radio", { name: "Grid", exact: true });
    await page.getByRole("radio", { name: "List", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(grid).toHaveAttribute("aria-checked", "true");
    await expectScreen(page, "segmented-control-basic-checked");
});

test("segmented-control / basic in RTL", async ({ page }) => {
    await openScenario(page, "/segmented-control/basic", { dir: "rtl" });
    await expect(
        page.locator('[data-primitives-part="segmented-control-indicator"]'),
    ).toHaveCount(1);
    await expectScreen(page, "segmented-control-basic-rtl");
});

test("segmented-control / vertical", async ({ page }) => {
    await openScenario(page, "/segmented-control/vertical");
    await expect(
        page.locator('[data-primitives-part="segmented-control-indicator"]'),
    ).toHaveCount(1);
    await expectScreen(page, "segmented-control-vertical");
});

test("segmented-control / disabled", async ({ page }) => {
    await openScenario(page, "/segmented-control/disabled");
    await expect(
        page.locator('[data-primitives-part="segmented-control-indicator"]'),
    ).toHaveCount(1);
    await expectScreen(page, "segmented-control-disabled");
});
