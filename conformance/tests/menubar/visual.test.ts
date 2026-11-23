import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("menubar / basic: the bar, the focus on an item", async ({ page }) => {
    await openScenario(page, "/menubar/basic");
    await page.getByRole("menuitem", { name: "File" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("menuitem", { name: "Edit" })).toBeFocused();
    await expectScreen(page, "menubar-basic-focused");
});

test("menubar / basic: a submenu open in the bar", async ({ page }) => {
    await openScenario(page, "/menubar/basic");
    await page.getByRole("menuitem", { name: "File" }).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("menuitem", { name: "Email" })).toBeFocused();
    await expectScreen(page, "menubar-basic-submenu");
});

test("menubar / basic: the checkable items", async ({ page }) => {
    await openScenario(page, "/menubar/basic");
    await page.getByRole("menuitem", { name: "View" }).focus();
    await page.keyboard.press("ArrowDown");
    await expect(
        page.getByRole("menuitemcheckbox", { name: "Show toolbar" }),
    ).toBeFocused();
    await expectScreen(page, "menubar-basic-view");
});

test("menubar / basic?dir=rtl: a menu open", async ({ page }) => {
    await openScenario(page, "/menubar/basic", { dir: "rtl" });
    await page.getByRole("menuitem", { name: "File" }).focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "New" })).toBeFocused();
    await expectScreen(page, "menubar-basic-rtl-open");
});

test("menubar / vertical: a menu at the end side", async ({ page }) => {
    await openScenario(page, "/menubar/vertical");
    await page.getByRole("menuitem", { name: "Shapes" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(
        page.getByRole("menuitem", { name: "Rectangle" }),
    ).toBeFocused();
    await expectScreen(page, "menubar-vertical-open");
});
