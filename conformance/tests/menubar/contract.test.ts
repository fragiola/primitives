import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/menubar.md: the bar's part, its items (Menu's Triggers, named `menu-*`), the one tab
// stop, the focusable disabled item, the menus' side
test("menubar / basic: the bar, its items and their states", async ({
    page,
}) => {
    await openScenario(page, "/menubar/basic");
    const root = part(page, "menubar", "root");
    await expect(root).toHaveAttribute("role", "menubar");
    await expect(root).toHaveAttribute("aria-orientation", "horizontal");
    await expect(root).toHaveAttribute("data-orientation", "horizontal");
    await expect(root).not.toHaveAttribute("data-disabled");
    await expect(root).not.toHaveAttribute("style");

    const triggers = part(root, "menu", "trigger");
    await expect(triggers).toHaveCount(4);
    for (const trigger of await triggers.all()) {
        await expect(trigger).toHaveAttribute("role", "menuitem");
        await expect(trigger).toHaveAttribute("type", "button");
        await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
        await expect(trigger).not.toHaveAttribute("data-popup-open");
    }
    await expect(triggers.nth(0)).toHaveAttribute("tabindex", "0");
    for (const index of [1, 2, 3]) {
        await expect(triggers.nth(index)).toHaveAttribute("tabindex", "-1");
    }
    // a disabled item stays focusable: no native `disabled`
    const help = triggers.nth(3);
    await expect(help).not.toHaveAttribute("disabled");
    await expect(help).toHaveAttribute("aria-disabled", "true");
    await expect(help).toHaveAttribute("data-disabled", "");

    await triggers.nth(0).focus();
    await page.keyboard.press("ArrowDown");
    await expect(triggers.nth(0)).toHaveAttribute("data-popup-open", "");
    await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "true");
    const positioner = part(page, "menu", "positioner");
    await expect(positioner).toHaveAttribute("data-side", "bottom");
    await expect(positioner).toHaveAttribute("data-align", "start");
    // the bar's arrows move the tab stop and the open menu
    await page.keyboard.press("ArrowRight");
    await expect(triggers.nth(1)).toHaveAttribute("tabindex", "0");
    await expect(triggers.nth(0)).toHaveAttribute("tabindex", "-1");
    await expect(triggers.nth(1)).toHaveAttribute("data-popup-open", "");
    await expect(triggers.nth(0)).not.toHaveAttribute("data-popup-open");
    await expect(part(page, "menu", "item").first()).not.toHaveAttribute(
        "data-highlighted",
    );
    await expectNoFalseStates(parts(page, "menubar"));
    await expectNoFalseStates(parts(page, "menu"));
});

test("menubar / vertical: the orientation, and the menus at the end side", async ({
    page,
}) => {
    await openScenario(page, "/menubar/vertical");
    const root = part(page, "menubar", "root");
    await expect(root).toHaveAttribute("aria-orientation", "vertical");
    await expect(root).toHaveAttribute("data-orientation", "vertical");
    const trigger = part(root, "menu", "trigger").first();
    await trigger.focus();
    await page.keyboard.press("ArrowRight");
    await expect(part(page, "menu", "positioner")).toHaveAttribute(
        "data-side",
        "inline-end",
    );
    await expect(part(page, "menu", "popup")).toHaveAttribute(
        "data-side",
        "inline-end",
    );
    await expectNoFalseStates(parts(page, "menubar"));
});

test("menubar / modal: the bar takes the pointer back", async ({ page }) => {
    await openScenario(page, "/menubar/modal");
    const root = part(page, "menubar", "root");
    await expect(root).toHaveCSS("pointer-events", "auto");
    await expect(root).toHaveAttribute("style", /pointer-events:\s*auto/);
});
