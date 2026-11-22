import { expect, test } from "@playwright/test";
import {
    expectNoFalseStates,
    expectOpenState,
    part,
    parts,
} from "../../src/contract.ts";
import { settleAnimations, slowMotion } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/menu.md: anatomy, state attributes
test("menu / basic: parts, highlight and disabled states", async ({ page }) => {
    await openScenario(page, "/menu/basic");
    await part(page, "menu", "trigger").focus();
    await page.keyboard.press("ArrowDown");
    // a trigger says its popup is open (D4 §3 "Naming"); `data-open` is the popup's own
    await expect(part(page, "menu", "trigger")).toHaveAttribute(
        "data-popup-open",
        "",
    );
    await expect(part(page, "menu", "trigger")).not.toHaveAttribute(
        "data-open",
    );
    await expect(part(page, "menu", "popup")).toHaveAttribute("data-open", "");
    await expect(part(page, "menu", "positioner")).toHaveAttribute(
        "data-side",
        "bottom",
    );
    const items = part(page, "menu", "item");
    await expect(items).toHaveCount(4);
    await expect(items.nth(0)).toHaveAttribute("data-highlighted", "");
    await expect(items.nth(1)).not.toHaveAttribute("data-highlighted");
    await expect(items.nth(2)).toHaveAttribute("data-disabled", "");
    await expect(part(page, "menu", "separator")).toHaveCount(1);
    await expectNoFalseStates(parts(page, "menu"));
});

test("menu / submenu: the submenu trigger and the nested levels", async ({
    page,
}) => {
    await openScenario(page, "/menu/submenu");
    await part(page, "menu", "trigger").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    const submenuTrigger = part(page, "menu", "submenu-trigger");
    await expect(submenuTrigger).toHaveAttribute("data-highlighted", "");
    await page.keyboard.press("ArrowRight");
    await expect(submenuTrigger).toHaveAttribute("data-popup-open", "");
    await expect(
        page.locator('[data-primitives-part="menu-popup"][data-nested]'),
    ).toHaveCount(1);
    await expect(
        page.locator('[data-primitives-part="menu-positioner"][data-nested]'),
    ).toHaveCount(1);
    await expect(
        page.locator('[data-primitives-part="menu-popup"][data-nested]'),
    ).toHaveAttribute("data-side", "inline-end");
    await expectNoFalseStates(parts(page, "menu"));
});

test("menu / groups: group and group label parts", async ({ page }) => {
    await openScenario(page, "/menu/groups");
    await part(page, "menu", "trigger").click();
    await expect(part(page, "menu", "group")).toHaveCount(2);
    await expect(part(page, "menu", "group-label")).toHaveCount(2);
});

test("menu / modal: the trigger and the positioner take the pointer back", async ({
    page,
}) => {
    await openScenario(page, "/menu/modal");
    await part(page, "menu", "trigger").click();
    await expect(part(page, "menu", "popup")).toHaveAttribute("data-open", "");
    await expect(part(page, "menu", "positioner")).toHaveCSS(
        "pointer-events",
        "auto",
    );
    await expect(part(page, "menu", "trigger")).toHaveCSS(
        "pointer-events",
        "auto",
    );
    await expect(page.locator("body")).toHaveCSS("pointer-events", "none");
    await page.keyboard.press("Escape");
    await expect(part(page, "menu", "popup")).toHaveCount(0);
    await expect(page.locator("body")).toHaveCSS("pointer-events", "auto");
    await expectNoFalseStates(parts(page, "menu"));
});

// spec/README.md, "State attributes": exactly one of data-open and data-closed, data-closed while
// the exit runs; the trigger keeps data-popup-open only
test("menu / basic: data-open, then data-closed while the exit runs", async ({
    page,
}) => {
    await openScenario(page, "/menu/basic");
    await slowMotion(page, 600);
    await page.getByRole("button", { name: "Actions" }).click();
    await expectOpenState(part(page, "menu", "positioner"), true);
    await expectOpenState(part(page, "menu", "popup"), true);
    await settleAnimations(page);
    await page.keyboard.press("Escape");
    await expect(part(page, "menu", "popup")).toHaveAttribute(
        "data-ending-style",
        "",
    );
    await expectOpenState(part(page, "menu", "positioner"), false);
    await expectOpenState(part(page, "menu", "popup"), false);
    await expect(part(page, "menu", "trigger").first()).not.toHaveAttribute(
        "data-closed",
    );
    await expect(part(page, "menu", "popup")).toHaveCount(0);
});

// spec/README.md, "Detached triggers": only the active trigger says its popup is open
test("menu / detached: data-popup-open on the active trigger only", async ({
    page,
}) => {
    await openScenario(page, "/menu/detached");
    await page.getByRole("button", { name: "Actions for Alan" }).click();
    await expect(
        page.getByRole("menu", { name: "Actions for Alan" }),
    ).toBeVisible();
    await expect(part(page, "menu", "trigger")).toHaveCount(3);
    await expect(page.locator("#actions-alan")).toHaveAttribute(
        "data-popup-open",
        "",
    );
    await expect(page.locator("#actions-ada")).not.toHaveAttribute(
        "data-popup-open",
    );
    await expect(page.locator("#actions-grace")).not.toHaveAttribute(
        "data-popup-open",
    );
    await expectOpenState(part(page, "menu", "popup"), true);
    await expectNoFalseStates(parts(page, "menu"));
});
