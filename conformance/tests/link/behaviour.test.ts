import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/link.md
const link = (page: Page, name: string) =>
    page.getByRole("link", { name, exact: true });

const hash = (page: Page) => page.evaluate(() => window.location.hash);

test.describe("link / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/link/basic");
    });

    test("the current link and the disabled one", async ({ page }) => {
        await expect(page.getByRole("link")).toHaveCount(3);
        await expect(link(page, "Home")).toHaveAttribute(
            "aria-current",
            "page",
        );
        await expect(link(page, "Docs")).not.toHaveAttribute("aria-current");
        const archive = link(page, "Archive");
        await expect(archive).not.toHaveAttribute("aria-current");
        await expect(archive).toHaveAttribute("aria-disabled", "true");
        await expect(archive).toHaveAttribute("href", "#archive");
        await expectOutput(page, "clicks", "0");
    });

    test("a click follows a link and reaches its handler", async ({ page }) => {
        await link(page, "Docs").click();
        await expect.poll(() => hash(page)).toBe("#docs");
        await expectOutput(page, "clicks", "1");
    });

    test("a disabled link's click navigates nowhere and reaches no handler", async ({
        page,
    }) => {
        await link(page, "Archive").click({ force: true });
        await expectOutput(page, "clicks", "0");
        expect(await hash(page)).toBe("");
    });

    test("the keyboard: the disabled link is a tab stop, Enter on it does nothing", async ({
        page,
    }) => {
        await link(page, "Home").focus();
        await page.keyboard.press("Tab");
        await expect(link(page, "Docs")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(link(page, "Archive")).toBeFocused();
        await page.keyboard.press("Enter");
        await expectOutput(page, "clicks", "0");
        expect(await hash(page)).toBe("");
        await page.keyboard.press("Shift+Tab");
        await expect(link(page, "Docs")).toBeFocused();
        await page.keyboard.press("Enter");
        await expect.poll(() => hash(page)).toBe("#docs");
        await expectOutput(page, "clicks", "1");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("link / router", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/link/router");
    });

    test("a router's link navigates through the router", async ({ page }) => {
        await expectOutput(page, "route", "/");
        await link(page, "Settings").click();
        await expectOutput(page, "route", "/settings");
        expect(await hash(page)).toBe("");
        expect(new URL(page.url()).pathname).toBe("/link/router");
    });

    test("a disabled router link reaches no router", async ({ page }) => {
        await link(page, "Settings").click();
        await expectOutput(page, "route", "/settings");
        const billing = link(page, "Billing");
        await expect(billing).toHaveAttribute("aria-disabled", "true");
        await billing.click({ force: true });
        await billing.focus();
        await page.keyboard.press("Enter");
        await expectOutput(page, "route", "/settings");
        expect(new URL(page.url()).pathname).toBe("/link/router");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});
