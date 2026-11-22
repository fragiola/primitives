import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { settleAnimations } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/navigation-menu.md
const trigger = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true });
const link = (page: Page, name: string) =>
    page.getByRole("link", { name, exact: true });
const content = (page: Page) =>
    page.locator('[data-primitives-part="navigation-menu-content"][data-open]');

test.describe("navigation-menu / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/navigation-menu/basic");
    });

    test("a named navigation of disclosure buttons, closed", async ({
        page,
    }) => {
        await expect(
            page.getByRole("navigation", { name: "Main" }),
        ).toBeVisible();
        for (const name of ["Products", "Learn"]) {
            await expect(trigger(page, name)).toHaveAttribute(
                "aria-expanded",
                "false",
            );
            await expect(trigger(page, name)).not.toHaveAttribute(
                "aria-controls",
            );
        }
        await expect(link(page, "Pricing")).toBeVisible();
        await expectNoAxeViolations(page);
    });

    test("a hover opens a Content after the delay, and names it from its Trigger", async ({
        page,
    }) => {
        await trigger(page, "Products").hover();
        await expectOutput(page, "value", "products");
        await expectOutput(page, "reason", "trigger-hover");
        await expect(trigger(page, "Products")).toHaveAttribute(
            "aria-expanded",
            "true",
        );
        const controls = await trigger(page, "Products").getAttribute(
            "aria-controls",
        );
        await expect(content(page)).toHaveAttribute("id", controls ?? "");
        await expect(link(page, "Analytics")).toBeVisible();
        await expect(link(page, "Analytics")).toHaveAttribute(
            "aria-current",
            "page",
        );
        await settleAnimations(page);
        await expectNoAxeViolations(page);
    });

    test("moving to another Trigger switches at once, with the activation direction", async ({
        page,
    }) => {
        await trigger(page, "Products").hover();
        await expectOutput(page, "value", "products");
        await trigger(page, "Learn").hover();
        await expectOutput(page, "value", "learn");
        await expect(link(page, "Guides")).toBeVisible();
        await expect(content(page)).toHaveAttribute(
            "data-activation-direction",
            "right",
        );
        await trigger(page, "Products").hover();
        await expectOutput(page, "value", "products");
        await expect(content(page)).toHaveAttribute(
            "data-activation-direction",
            "left",
        );
    });

    test("the pointer leaving closes a hover-opened Content after the close delay", async ({
        page,
    }) => {
        await trigger(page, "Products").hover();
        await expectOutput(page, "value", "products");
        // over the popup: still open
        await link(page, "Reports").hover();
        await page.waitForTimeout(150);
        await expectOutput(page, "value", "products");
        await page.mouse.move(600, 600);
        await expectOutput(page, "value", "none");
        await expectOutput(page, "reason", "trigger-hover");
    });

    test("a press opens it, it stays when the pointer leaves, and a second press closes it", async ({
        page,
    }) => {
        await page.mouse.move(600, 600);
        await trigger(page, "Products").click();
        await expectOutput(page, "value", "products");
        await page.mouse.move(600, 600);
        await page.waitForTimeout(150);
        await expectOutput(page, "value", "products");
        await page.waitForTimeout(450);
        await trigger(page, "Products").click();
        await expectOutput(page, "value", "none");
        await expectOutput(page, "reason", "trigger-press");
    });

    test("keyboard: Enter opens with focus on the Trigger; Tab enters the Content, then continues after the Trigger", async ({
        page,
    }) => {
        await trigger(page, "Products").focus();
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "products");
        await expectOutput(page, "reason", "trigger-press");
        await expect(trigger(page, "Products")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(link(page, "Analytics")).toBeFocused();
        await page.keyboard.press("Shift+Tab");
        await expect(trigger(page, "Products")).toBeFocused();
        for (const name of ["Analytics", "Automation", "Reports"]) {
            await page.keyboard.press("Tab");
            await expect(link(page, name)).toBeFocused();
        }
        await page.keyboard.press("Tab");
        await expect(trigger(page, "Learn")).toBeFocused();
        await expectOutput(page, "value", "products");
    });

    test("the arrow keys move between the items, wrapping; Home and End", async ({
        page,
    }) => {
        await trigger(page, "Products").focus();
        await page.keyboard.press("ArrowRight");
        await expect(trigger(page, "Learn")).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(link(page, "Pricing")).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(trigger(page, "Products")).toBeFocused();
        await page.keyboard.press("ArrowLeft");
        await expect(link(page, "Pricing")).toBeFocused();
        await page.keyboard.press("Home");
        await expect(trigger(page, "Products")).toBeFocused();
        await page.keyboard.press("End");
        await expect(link(page, "Pricing")).toBeFocused();
        await expectOutput(page, "value", "none");
    });

    test("ArrowDown opens with focus inside; Escape closes, focus on the Trigger", async ({
        page,
    }) => {
        await trigger(page, "Products").focus();
        await page.keyboard.press("ArrowDown");
        await expectOutput(page, "value", "products");
        await expectOutput(page, "reason", "list-navigation");
        await expect(link(page, "Analytics")).toBeFocused();
        await page.keyboard.press("Escape");
        await expectOutput(page, "value", "none");
        await expectOutput(page, "reason", "escape-key");
        await expect(trigger(page, "Products")).toBeFocused();
    });

    test("an outside press closes it; so does focus leaving the navigation", async ({
        page,
    }) => {
        await trigger(page, "Products").click();
        await expectOutput(page, "value", "products");
        await page.mouse.click(600, 600);
        await expectOutput(page, "value", "none");
        await expectOutput(page, "reason", "outside-press");
        await trigger(page, "Learn").click();
        await expectOutput(page, "value", "learn");
        await link(page, "Pricing").focus();
        await expectOutput(page, "value", "learn");
        await page.keyboard.press("Tab");
        await expect(
            page.getByRole("button", { name: "Outside button" }),
        ).toBeFocused();
        await expectOutput(page, "value", "none");
        await expectOutput(page, "reason", "focus-out");
    });
});

test.describe("navigation-menu / basic, RTL", () => {
    test("the arrow keys follow the reading direction; the activation direction stays physical", async ({
        page,
    }) => {
        await openScenario(page, "/navigation-menu/basic", { dir: "rtl" });
        await trigger(page, "Products").focus();
        await page.keyboard.press("ArrowLeft");
        await expect(trigger(page, "Learn")).toBeFocused();
        await trigger(page, "Products").hover();
        await expectOutput(page, "value", "products");
        await trigger(page, "Learn").hover();
        await expectOutput(page, "value", "learn");
        await expect(content(page)).toHaveAttribute(
            "data-activation-direction",
            "left",
        );
    });
});

test.describe("navigation-menu / nested", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/navigation-menu/nested");
        await page.mouse.move(600, 600);
        await trigger(page, "Products").click();
        await expectOutput(page, "value", "products");
    });

    test("a nested level opens from the Content; Escape closes one level at a time", async ({
        page,
    }) => {
        await trigger(page, "Developers").click();
        await expectOutput(page, "nested", "developers");
        await expect(link(page, "API")).toBeVisible();
        await link(page, "API").focus();
        await page.keyboard.press("Escape");
        await expectOutput(page, "nested", "none");
        await expectOutput(page, "value", "products");
        await expect(trigger(page, "Developers")).toBeFocused();
        await page.keyboard.press("Escape");
        await expectOutput(page, "value", "none");
        await expect(trigger(page, "Products")).toBeFocused();
    });

    test("the nested List is vertical: ArrowDown moves, ArrowRight opens with focus inside", async ({
        page,
    }) => {
        await trigger(page, "Developers").focus();
        await page.keyboard.press("ArrowDown");
        await expect(link(page, "Teams")).toBeFocused();
        await page.keyboard.press("ArrowUp");
        await expect(trigger(page, "Developers")).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expectOutput(page, "nested", "developers");
        await expect(link(page, "API")).toBeFocused();
        await expectOutput(page, "value", "products");
    });

    test("an outside press closes both levels", async ({ page }) => {
        await trigger(page, "Developers").click();
        await expectOutput(page, "nested", "developers");
        await page.mouse.click(5, 600);
        await expectOutput(page, "nested", "none");
        await expectOutput(page, "value", "none");
    });

    test("axe finds no violation with both open", async ({ page }) => {
        await trigger(page, "Developers").click();
        await expectOutput(page, "nested", "developers");
        await settleAnimations(page);
        await expectNoAxeViolations(page);
    });
});
