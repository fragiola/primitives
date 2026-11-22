import { expect, test } from "@playwright/test";
import {
    expectNoFalseStates,
    expectOpenState,
    part,
    parts,
} from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/context-menu.md: Menu's parts, named context-menu-*
test("context-menu / basic: parts and states", async ({ page }) => {
    await openScenario(page, "/context-menu/basic");
    const trigger = part(page, "context-menu", "trigger");
    await expect(trigger).toHaveCount(1);
    await expect(trigger).not.toHaveAttribute("role");
    await expect(trigger).not.toHaveAttribute("aria-haspopup");
    await expect(trigger).not.toHaveAttribute("style");
    await page.getByRole("button", { name: "report.pdf" }).focus();
    await page.keyboard.press("Shift+F10");
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    const positioner = part(page, "context-menu", "positioner");
    await expectOpenState(positioner, true);
    await expect(positioner).toHaveAttribute("data-side", "bottom");
    await expect(positioner).toHaveAttribute("data-align", "start");
    const popup = part(page, "context-menu", "popup");
    await expectOpenState(popup, true);
    await expect(popup).toHaveAttribute("role", "menu");
    await expect(popup).not.toHaveAttribute("aria-labelledby");
    await expect(popup).not.toHaveAttribute("data-nested");
    const items = part(page, "context-menu", "item");
    await expect(items).toHaveCount(3);
    await expect(items.nth(0)).toHaveAttribute("data-highlighted", "");
    await expect(part(page, "context-menu", "separator")).toHaveCount(1);
    await expect(part(page, "context-menu", "submenu-trigger")).toHaveCount(1);
    // Menu's parts, named by the ContextMenu's Root
    await expect(page.locator('[data-primitives-part^="menu-"]')).toHaveCount(
        0,
    );
    await page.keyboard.press("End");
    await page.keyboard.press("ArrowRight");
    const nested = page.locator(
        '[data-primitives-part="context-menu-popup"][data-nested]',
    );
    await expect(nested).toHaveCount(1);
    await expect(nested).toHaveAttribute("aria-labelledby", /.+/);
    await expect(
        page.locator(
            '[data-primitives-part="context-menu-positioner"][data-nested]',
        ),
    ).toHaveCount(1);
    await expectNoFalseStates(parts(page, "context-menu"));
});
