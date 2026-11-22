import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { isInertOrHidden } from "../../src/focus.ts";
import { expectOutput } from "../../src/output.ts";
import { settleAnimations } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/alert-dialog.md
const button = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true, includeHidden: true });

test.describe("alert-dialog / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/alert-dialog/basic");
    });

    const trigger = (page: Page) => button(page, "Discard draft");
    const alert = (page: Page) =>
        page.getByRole("alertdialog", { name: "Discard draft?" });

    test("the trigger announces a dialog and its state", async ({ page }) => {
        await expect(trigger(page)).toHaveAttribute("aria-haspopup", "dialog");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
        await trigger(page).click();
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
    });

    test("opens a named, described, modal alertdialog with focus on its Close", async ({
        page,
    }) => {
        await trigger(page).click();
        await expect(alert(page)).toBeVisible();
        await expect(alert(page)).toHaveAttribute("aria-modal", "true");
        await expect(alert(page)).toHaveAccessibleDescription(
            "Your unsaved changes will be lost.",
        );
        await expectOutput(page, "open", "true");
        await expectOutput(page, "reason", "trigger-press");
        // the first Close, not the first tabbable element ("Discard")
        await expect(button(page, "Cancel")).toBeFocused();
    });

    test("traps Tab inside and makes the page inert", async ({ page }) => {
        await trigger(page).click();
        await expect(button(page, "Cancel")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(button(page, "Discard")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(button(page, "Cancel")).toBeFocused();
        expect(await isInertOrHidden(button(page, "Outside button"))).toBe(
            true,
        );
    });

    test("a press outside does nothing: it stays open with focus where it was", async ({
        page,
    }) => {
        await trigger(page).click();
        await expect(button(page, "Cancel")).toBeFocused();
        await settleAnimations(page);
        await page.mouse.click(5, 5);
        await page.waitForTimeout(200);
        await expect(alert(page)).toBeVisible();
        await expectOutput(page, "open", "true");
        await expectOutput(page, "reason", "trigger-press");
        await expect(button(page, "Cancel")).toBeFocused();
    });

    test("Escape closes it and returns focus to the trigger", async ({
        page,
    }) => {
        await trigger(page).click();
        await expect(alert(page)).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(alert(page)).toBeHidden();
        await expectOutput(page, "open", "false");
        await expectOutput(page, "reason", "escape-key");
        await expect(trigger(page)).toBeFocused();
    });

    test("Cancel closes it with close-press", async ({ page }) => {
        await trigger(page).click();
        await button(page, "Cancel").click();
        await expect(alert(page)).toBeHidden();
        await expectOutput(page, "reason", "close-press");
        await expect(trigger(page)).toBeFocused();
    });

    test("Discard acts, then closes it through the actions", async ({
        page,
    }) => {
        await trigger(page).click();
        await button(page, "Discard").click();
        await expect(alert(page)).toBeHidden();
        await expectOutput(page, "action", "discard");
        await expectOutput(page, "open", "false");
        await expectOutput(page, "reason", "imperative-action");
        await expect(trigger(page)).toBeFocused();
    });

    test("has no axe violation while open", async ({ page }) => {
        await trigger(page).click();
        await expect(alert(page)).toBeVisible();
        await expectNoAxeViolations(page);
    });
});

test.describe("alert-dialog / detached", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/alert-dialog/detached");
    });

    test("each trigger opens it with its payload, and gets the focus back", async ({
        page,
    }) => {
        await button(page, "Delete Grace").click();
        await expect(
            page.getByRole("alertdialog", { name: "Delete Grace?" }),
        ).toBeVisible();
        await expectOutput(page, "trigger", "delete-grace");
        await expect(button(page, "Delete Grace")).toHaveAttribute(
            "aria-expanded",
            "true",
        );
        await expect(button(page, "Delete Ada")).toHaveAttribute(
            "aria-expanded",
            "false",
        );
        await expect(button(page, "Cancel")).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(button(page, "Delete Grace")).toBeFocused();
        await button(page, "Delete Ada").click();
        await expect(
            page.getByRole("alertdialog", { name: "Delete Ada?" }),
        ).toBeVisible();
        await button(page, "Cancel").click();
        await expect(button(page, "Delete Ada")).toBeFocused();
    });

    test("the handle opens it from a trigger's id", async ({ page }) => {
        await button(page, "Delete for Grace").click();
        await expect(
            page.getByRole("alertdialog", { name: "Delete Grace?" }),
        ).toBeVisible();
        await expectOutput(page, "reason", "imperative-action");
        await expectOutput(page, "trigger", "delete-grace");
    });

    test("a press on the viewport outside the popup does nothing", async ({
        page,
    }) => {
        await button(page, "Delete Ada").click();
        const alert = page.getByRole("alertdialog", { name: "Delete Ada?" });
        await expect(alert).toBeVisible();
        await settleAnimations(page);
        await page.mouse.click(5, 5);
        await page.waitForTimeout(200);
        await expect(alert).toBeVisible();
        await expectOutput(page, "reason", "trigger-press");
    });

    test("has no axe violation while open", async ({ page }) => {
        await button(page, "Delete Ada").click();
        await expect(page.getByRole("alertdialog")).toBeVisible();
        await expectNoAxeViolations(page);
    });
});
