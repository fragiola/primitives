import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/steps.md
const button = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true });

test.describe("steps / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/steps/basic");
    });

    test("a list of three steps, the first current", async ({ page }) => {
        const list = page.getByRole("list", { name: "Checkout" });
        const items = list.getByRole("listitem");
        await expect(items).toHaveCount(3);
        await expect(items.nth(0)).toHaveAttribute("aria-current", "step");
        await expect(items.nth(1)).not.toHaveAttribute("aria-current");
        await expect(button(page, "Shipping")).toHaveAttribute(
            "aria-current",
            "step",
        );
        await expect(page.getByText("Shipping address")).toBeVisible();
        await expect(page.getByText("Payment method")).toBeHidden();
        await expect(page.getByText("Review your order")).toBeHidden();
        await expect(page.getByText("Order placed")).toBeHidden();
        await expect(button(page, "Back")).toBeDisabled();
        await expectOutput(page, "step", "none");
    });

    test("Continue, a step's trigger and Back", async ({ page }) => {
        await button(page, "Continue").click();
        await expectOutput(page, "step", "1");
        await expectOutput(page, "reason", "next-press");
        await expect(button(page, "Payment")).toHaveAttribute(
            "aria-current",
            "step",
        );
        await expect(button(page, "Shipping")).not.toHaveAttribute(
            "aria-current",
        );
        await expect(page.getByText("Payment method")).toBeVisible();
        await expect(page.getByText("Shipping address")).toBeHidden();
        await button(page, "Review").click();
        await expectOutput(page, "step", "2");
        await expectOutput(page, "reason", "trigger-press");
        await button(page, "Back").click();
        await expectOutput(page, "step", "1");
        await expectOutput(page, "reason", "previous-press");
    });

    test("past the last step: the completed state", async ({ page }) => {
        await button(page, "Continue").click();
        await button(page, "Continue").click();
        await expectOutput(page, "step", "2");
        await button(page, "Continue").click();
        await expectOutput(page, "step", "3");
        await expect(page.getByText("Order placed")).toBeVisible();
        for (const text of [
            "Shipping address",
            "Payment method",
            "Review your order",
        ]) {
            await expect(page.getByText(text)).toBeHidden();
        }
        await expect(button(page, "Continue")).toBeDisabled();
        await expect(page.locator("[aria-current]")).toHaveCount(0);
    });

    test("the keyboard: every enabled trigger is a tab stop", async ({
        page,
    }) => {
        await button(page, "Shipping").focus();
        await page.keyboard.press("Tab");
        await expect(button(page, "Payment")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(button(page, "Review")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(button(page, "Continue")).toBeFocused();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Shift+Tab");
        await expect(button(page, "Payment")).toBeFocused();
        await page.keyboard.press("Enter");
        await expectOutput(page, "step", "1");
        await expectOutput(page, "reason", "trigger-press");
        await expect(button(page, "Payment")).toBeFocused();
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("steps / linear", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/steps/linear");
    });

    const terms = (page: Page) =>
        page.getByRole("checkbox", { name: "I accept the terms" });

    test("a step is reached only once the steps before it are valid", async ({
        page,
    }) => {
        await expect(button(page, "Next")).toBeDisabled();
        await expect(button(page, "Profile")).toBeDisabled();
        await expect(button(page, "Done")).toBeDisabled();
        await expect(button(page, "Account")).toBeEnabled();
        await terms(page).check();
        await expect(button(page, "Next")).toBeEnabled();
        await expect(button(page, "Profile")).toBeEnabled();
        await expect(button(page, "Done")).toBeEnabled();
        await button(page, "Done").click();
        await expectOutput(page, "step", "2");
        await expectOutput(page, "reason", "trigger-press");
        await expect(page.getByText("All set")).toBeVisible();
    });

    test("a step before is always reached; the validity holds the later ones", async ({
        page,
    }) => {
        await terms(page).check();
        await button(page, "Done").click();
        await button(page, "Account").click();
        await expectOutput(page, "step", "0");
        await terms(page).uncheck();
        await expect(button(page, "Profile")).toBeDisabled();
        await expect(button(page, "Done")).toBeDisabled();
        await expect(button(page, "Next")).toBeDisabled();
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});
