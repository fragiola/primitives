import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

// One golden set for every framework, made by React in CI (AGENTS.md rule 5)
test.beforeEach(visualOnlyInCi);

test("context-menu / basic: open at a point", async ({ page }) => {
    await openScenario(page, "/context-menu/basic");
    const area = page.locator('[data-primitives-part="context-menu-trigger"]');
    await area.click({ button: "right", position: { x: 40, y: 40 } });
    await expect(
        page.getByRole("menu", { name: "File actions" }),
    ).toBeVisible();
    await expectScreen(page, "context-menu-basic-open");
});

test("context-menu / basic: the submenu open from the keyboard", async ({
    page,
}) => {
    await openScenario(page, "/context-menu/basic");
    await page.getByRole("button", { name: "report.pdf" }).focus();
    await page.keyboard.press("Shift+F10");
    await page.keyboard.press("End");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("menuitem", { name: "Email" })).toBeFocused();
    await expectScreen(page, "context-menu-basic-submenu");
});

test("context-menu / rtl: open at a point", async ({ page }) => {
    await openScenario(page, "/context-menu/rtl", { dir: "rtl" });
    const area = page.locator('[data-primitives-part="context-menu-trigger"]');
    await area.click({ button: "right", position: { x: 200, y: 40 } });
    await expect(
        page.getByRole("menu", { name: "File actions" }),
    ).toBeVisible();
    await expectScreen(page, "context-menu-rtl-open");
});
