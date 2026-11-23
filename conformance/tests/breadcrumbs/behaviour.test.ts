import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/breadcrumbs.md
const trail = (page: Page) =>
    page.getByRole("navigation", { name: "Breadcrumb", exact: true });

const link = (scope: Locator, name: string) =>
    scope.getByRole("link", { name, exact: true });

const hash = (page: Page) => page.evaluate(() => window.location.hash);

test.describe("breadcrumbs / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/breadcrumbs/basic");
    });

    test("a named navigation holding a list of four links", async ({
        page,
    }) => {
        const nav = trail(page);
        await expect(nav).toBeVisible();
        const list = nav.getByRole("list");
        await expect(list).toHaveCount(1);
        await expect(list.getByRole("listitem")).toHaveCount(4);
        await expect(nav.getByRole("link")).toHaveText([
            "Home",
            "Docs",
            "Components",
            "Breadcrumbs",
        ]);
    });

    test("the current page and the disabled link", async ({ page }) => {
        const nav = trail(page);
        await expect(link(nav, "Breadcrumbs")).toHaveAttribute(
            "aria-current",
            "page",
        );
        await expect(nav.locator("[aria-current]")).toHaveCount(1);
        await expect(link(nav, "Components")).toHaveAttribute(
            "aria-disabled",
            "true",
        );
    });

    test("a link navigates, a disabled one does not", async ({ page }) => {
        const nav = trail(page);
        await link(nav, "Components").click({ force: true });
        expect(await hash(page)).toBe("");
        await link(nav, "Docs").click();
        await expect.poll(() => hash(page)).toBe("#docs");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("breadcrumbs / collapsed", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/breadcrumbs/collapsed");
    });

    const ellipsis = (page: Page) =>
        trail(page).getByRole("button", {
            name: "Show the hidden pages",
            exact: true,
        });

    test("the trail, its current page and the Ellipsis", async ({ page }) => {
        const nav = trail(page);
        await expect(nav.getByRole("listitem")).toHaveCount(4);
        await expect(nav.getByRole("link")).toHaveText(["Home", "Guides"]);
        const current = nav.getByText("Routing", { exact: true });
        await expect(current).toHaveAttribute("aria-current", "page");
        await expect(ellipsis(page)).toHaveAttribute("aria-haspopup", "menu");
        await expectOutput(page, "chosen", "none");
    });

    test("the Ellipsis opens the menu of the hidden pages", async ({
        page,
    }) => {
        await ellipsis(page).click();
        const menu = page.getByRole("menu");
        await expect(menu).toBeVisible();
        await expect(menu.getByRole("menuitem")).toHaveText([
            "Docs",
            "Components",
        ]);
        await menu.getByRole("menuitem", { name: "Components" }).click();
        await expect(menu).toBeHidden();
        await expectOutput(page, "chosen", "Components");
        await expect(ellipsis(page)).toBeFocused();
    });

    test("the keyboard opens it on its first item, Escape closes it", async ({
        page,
    }) => {
        await ellipsis(page).focus();
        await page.keyboard.press("Enter");
        const menu = page.getByRole("menu");
        await expect(menu).toBeVisible();
        await expect(
            menu.getByRole("menuitem", { name: "Docs" }),
        ).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(menu).toBeHidden();
        await expect(ellipsis(page)).toBeFocused();
    });

    test("has no axe violation, with the menu open too", async ({ page }) => {
        await expectNoAxeViolations(page);
        await ellipsis(page).click();
        await expect(page.getByRole("menu")).toBeVisible();
        await expectNoAxeViolations(page);
    });
});
