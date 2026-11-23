import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/menubar.md
const bar = (page: Page, name: string) => page.getByRole("menubar", { name });
/** An item of the bar (a Menu.Trigger), or an item of an open menu. */
const item = (page: Page, name: string) => page.getByRole("menuitem", { name });
const menu = (page: Page, name: string) => page.getByRole("menu", { name });
const button = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true });

/** Presses `key` and expects the focus on `target`. */
async function step(page: Page, key: string, target: Locator): Promise<void> {
    await page.keyboard.press(key);
    await expect(target).toBeFocused();
}

/** The open menus of the page. */
const openMenus = (page: Page) => page.getByRole("menu");

/** Taps the center of `target` (a touch context). */
async function tap(page: Page, target: Locator): Promise<void> {
    const box = await target.boundingBox();
    expect(box).not.toBeNull();
    const { x, y, width, height } = box as NonNullable<typeof box>;
    await page.touchscreen.tap(x + width / 2, y + height / 2);
}

test.describe("menubar / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/menubar/basic");
    });

    test("a named horizontal menubar of menu items that open menus; a disabled one", async ({
        page,
    }) => {
        const menubar = bar(page, "Application");
        await expect(menubar).toHaveAttribute("aria-orientation", "horizontal");
        const items = menubar.getByRole("menuitem");
        await expect(items).toHaveText(["File", "Edit", "View", "Help"]);
        for (const entry of await items.all()) {
            await expect(entry).toHaveAttribute("aria-haspopup", "menu");
            await expect(entry).toHaveAttribute("aria-expanded", "false");
        }
        await expect(item(page, "Help")).toHaveAttribute(
            "aria-disabled",
            "true",
        );
    });

    test("one tab stop for the whole bar", async ({ page }) => {
        await button(page, "Before").focus();
        await step(page, "Tab", item(page, "File"));
        await step(page, "Tab", button(page, "After"));
        await step(page, "Shift+Tab", item(page, "File"));
        await expect(
            bar(page, "Application").locator('[tabindex="0"]'),
        ).toHaveCount(1);
    });

    test("the arrows, Home and End move between the items, wrapping; the last focused keeps the tab stop", async ({
        page,
    }) => {
        await item(page, "File").focus();
        await step(page, "ArrowRight", item(page, "Edit"));
        await step(page, "ArrowRight", item(page, "View"));
        await step(page, "ArrowRight", item(page, "Help"));
        await step(page, "ArrowRight", item(page, "File"));
        await step(page, "ArrowLeft", item(page, "Help"));
        await step(page, "Home", item(page, "File"));
        await step(page, "End", item(page, "Help"));
        await expectOutput(page, "menu", "none");
        await expect(openMenus(page)).toHaveCount(0);
        await item(page, "View").focus();
        await step(page, "Tab", button(page, "After"));
        await step(page, "Shift+Tab", item(page, "View"));
    });

    test("ArrowDown, ArrowUp, Enter and Space open a menu on its first or last item; Escape returns to the item", async ({
        page,
    }) => {
        const file = item(page, "File");
        await file.focus();
        await page.keyboard.press("ArrowDown");
        await expect(menu(page, "File")).toBeVisible();
        await expect(item(page, "New")).toBeFocused();
        await expectOutput(page, "menu", "File");
        await expectOutput(page, "reason", "list-navigation");
        await page.keyboard.press("Escape");
        await expect(menu(page, "File")).toBeHidden();
        await expectOutput(page, "reason", "escape-key");
        await expect(file).toBeFocused();

        await page.keyboard.press("ArrowUp");
        await expect(item(page, "Print")).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(file).toBeFocused();

        await page.keyboard.press("Enter");
        await expect(item(page, "New")).toBeFocused();
        await expectOutput(page, "reason", "trigger-press");
        await page.keyboard.press("Escape");
        await expect(file).toBeFocused();
        await page.keyboard.press("Space");
        await expect(item(page, "New")).toBeFocused();
        await expectOutput(page, "reason", "trigger-press");
    });

    test("in a menu, the bar's arrows move to the neighbour's menu, the focus kept on its item", async ({
        page,
    }) => {
        await item(page, "File").focus();
        await page.keyboard.press("ArrowDown");
        await expect(item(page, "New")).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(item(page, "Edit")).toBeFocused();
        await expect(menu(page, "Edit")).toBeVisible();
        await expect(menu(page, "File")).toBeHidden();
        await expectOutput(page, "menu", "Edit");
        await expectOutput(page, "reason", "list-navigation");
        await expect(
            menu(page, "Edit").locator("[data-highlighted]"),
        ).toHaveCount(0);
        await step(page, "ArrowDown", item(page, "Undo"));
        await page.keyboard.press("ArrowLeft");
        await expect(item(page, "File")).toBeFocused();
        await expect(menu(page, "File")).toBeVisible();
        await expect(menu(page, "Edit")).toBeHidden();
        await expectOutput(page, "menu", "File");
    });

    test("on an item whose menu is open, the arrows move on and open the next menu; the open keys go into it", async ({
        page,
    }) => {
        await item(page, "File").focus();
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowLeft");
        await expect(item(page, "File")).toBeFocused();
        await expect(menu(page, "File")).toBeVisible();
        // the focus is on "File", its menu open
        await page.keyboard.press("ArrowRight");
        await expect(item(page, "Edit")).toBeFocused();
        await expect(menu(page, "Edit")).toBeVisible();
        await expect(menu(page, "File")).toBeHidden();
        await expectOutput(page, "menu", "Edit");
        await step(page, "ArrowUp", item(page, "Copy"));
        await page.keyboard.press("Escape");
        await expect(menu(page, "Edit")).toBeHidden();
        await expect(item(page, "Edit")).toBeFocused();

        // to a disabled item: the open menu closes, none opens
        await item(page, "File").focus();
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowLeft");
        await expect(menu(page, "File")).toBeVisible();
        await expect(item(page, "File")).toBeFocused();
        await page.keyboard.press("ArrowLeft");
        await expect(item(page, "Help")).toBeFocused();
        await expect(openMenus(page)).toHaveCount(0);
        await expectOutput(page, "menu", "none");
    });

    test("submenus inside the bar: the open key opens them, the previous key closes them, the next key moves on", async ({
        page,
    }) => {
        await item(page, "File").focus();
        await page.keyboard.press("ArrowDown");
        await step(page, "ArrowDown", item(page, "Open"));
        await step(page, "ArrowDown", item(page, "Share"));
        await page.keyboard.press("ArrowRight");
        await expect(menu(page, "Share")).toBeVisible();
        await expect(item(page, "Email")).toBeFocused();
        await page.keyboard.press("ArrowLeft");
        await expect(menu(page, "Share")).toBeHidden();
        await expect(item(page, "Share")).toBeFocused();
        await expect(menu(page, "File")).toBeVisible();
        await page.keyboard.press("ArrowRight");
        await expect(item(page, "Email")).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(item(page, "Edit")).toBeFocused();
        await expect(menu(page, "Edit")).toBeVisible();
        await expect(menu(page, "Share")).toBeHidden();
        await expect(menu(page, "File")).toBeHidden();
        await expectOutput(page, "menu", "Edit");

        await page.keyboard.press("Escape");
        await item(page, "File").focus();
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowRight");
        await step(page, "ArrowDown", item(page, "Link"));
        await page.keyboard.press("Enter");
        await expectOutput(page, "action", "Link");
        await expectOutput(page, "reason", "item-press");
        await expect(openMenus(page)).toHaveCount(0);
        await expect(item(page, "File")).toBeFocused();
    });

    test("checkbox and radio items inside the bar: Space keeps the menu open, Enter closes it", async ({
        page,
    }) => {
        await item(page, "View").focus();
        await page.keyboard.press("ArrowDown");
        const statusBar = page.getByRole("menuitemcheckbox", {
            name: "Show status bar",
        });
        await step(page, "ArrowDown", statusBar);
        await page.keyboard.press("Space");
        await expectOutput(page, "status bar", "true");
        await expect(statusBar).toHaveAttribute("aria-checked", "true");
        await expect(menu(page, "View")).toBeVisible();
        const dark = page.getByRole("menuitemradio", { name: "Dark" });
        await step(
            page,
            "ArrowDown",
            page.getByRole("menuitemradio", { name: "Light" }),
        );
        await step(page, "ArrowDown", dark);
        await page.keyboard.press("Space");
        await expectOutput(page, "theme", "dark");
        await expect(dark).toHaveAttribute("aria-checked", "true");
        await expect(menu(page, "View")).toBeVisible();
        await page.keyboard.press("Home");
        await page.keyboard.press("Enter");
        await expectOutput(page, "toolbar", "false");
        await expectOutput(page, "reason", "item-press");
        await expect(menu(page, "View")).toBeHidden();
        await expect(item(page, "View")).toBeFocused();
    });

    test("Tab closes the open menu and leaves the bar", async ({ page }) => {
        await item(page, "File").focus();
        await page.keyboard.press("ArrowDown");
        await expect(menu(page, "File")).toBeVisible();
        await page.keyboard.press("Tab");
        await expect(menu(page, "File")).toBeHidden();
        await expectOutput(page, "reason", "focus-out");
        await expect(button(page, "After")).toBeFocused();

        // from an item whose menu a move opened (the focus on the bar's item)
        await item(page, "File").focus();
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowRight");
        await expect(item(page, "Edit")).toBeFocused();
        await expect(menu(page, "Edit")).toBeVisible();
        await page.keyboard.press("Tab");
        await expect(menu(page, "Edit")).toBeHidden();
        await expectOutput(page, "reason", "focus-out");
        await expectOutput(page, "menu", "none");
        await expect(button(page, "After")).toBeFocused();
    });

    test("hover switches menus once one is open; the press right after a hover opening keeps it", async ({
        page,
    }) => {
        await item(page, "File").hover();
        await expect(openMenus(page)).toHaveCount(0);
        await item(page, "File").click();
        await expect(menu(page, "File")).toBeVisible();
        await expect(menu(page, "File")).toBeFocused();
        await expectOutput(page, "reason", "trigger-press");
        await item(page, "Edit").hover();
        await expect(menu(page, "Edit")).toBeVisible();
        await expect(menu(page, "File")).toBeHidden();
        await expectOutput(page, "menu", "Edit");
        await expectOutput(page, "reason", "trigger-hover");
        await item(page, "View").hover();
        await expect(menu(page, "View")).toBeVisible();
        await expectOutput(page, "menu", "View");
        await item(page, "Help").hover();
        await expect(menu(page, "View")).toBeVisible();
        await expectOutput(page, "menu", "View");
        await item(page, "View").click();
        await expect(menu(page, "View")).toBeVisible();
        await expectOutput(page, "menu", "View");
        await page.waitForTimeout(600);
        await item(page, "View").click();
        await expect(openMenus(page)).toHaveCount(0);
        await expectOutput(page, "menu", "none");
        await expectOutput(page, "reason", "trigger-press");
    });

    test("non-modal: an outside press closes the menu and reaches the page", async ({
        page,
    }) => {
        await item(page, "File").click();
        await expect(menu(page, "File")).toBeVisible();
        await button(page, "After").click();
        await expect(menu(page, "File")).toBeHidden();
        await expectOutput(page, "reason", "outside-press");
        await expect(button(page, "After")).toBeFocused();
    });

    test("a disabled item opens nothing", async ({ page }) => {
        const help = item(page, "Help");
        await help.focus();
        for (const key of ["ArrowDown", "Enter", "Space"]) {
            await page.keyboard.press(key);
            await expect(help).toBeFocused();
        }
        await help.click({ force: true });
        await expect(openMenus(page)).toHaveCount(0);
        await expectOutput(page, "menu", "none");
    });

    test("has no axe violation, closed and with a menu open", async ({
        page,
    }) => {
        await expectNoAxeViolations(page);
        await item(page, "File").click();
        await expect(menu(page, "File")).toBeVisible();
        await expectNoAxeViolations(page);
    });
});

test.describe("menubar / basic?dir=rtl", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/menubar/basic", { dir: "rtl" });
    });

    test("ArrowLeft is the next item, ArrowRight the previous; Home and End", async ({
        page,
    }) => {
        await item(page, "File").focus();
        await step(page, "ArrowLeft", item(page, "Edit"));
        await step(page, "ArrowRight", item(page, "File"));
        await step(page, "ArrowRight", item(page, "Help"));
        await step(page, "Home", item(page, "File"));
        await step(page, "End", item(page, "Help"));
    });

    test("in a menu, ArrowLeft moves to the next menu and ArrowRight back", async ({
        page,
    }) => {
        await item(page, "File").focus();
        await page.keyboard.press("ArrowDown");
        await expect(item(page, "New")).toBeFocused();
        await page.keyboard.press("ArrowLeft");
        await expect(item(page, "Edit")).toBeFocused();
        await expect(menu(page, "Edit")).toBeVisible();
        await expectOutput(page, "menu", "Edit");
        await page.keyboard.press("ArrowRight");
        await expect(item(page, "File")).toBeFocused();
        await expect(menu(page, "File")).toBeVisible();
        await expectOutput(page, "menu", "File");
    });

    test("a submenu opens with ArrowLeft, on the left, and closes with ArrowRight", async ({
        page,
    }) => {
        await item(page, "File").focus();
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowDown");
        await step(page, "ArrowDown", item(page, "Share"));
        await page.keyboard.press("ArrowLeft");
        await expect(item(page, "Email")).toBeFocused();
        const share = await item(page, "Share").boundingBox();
        const submenu = await menu(page, "Share").boundingBox();
        if (share === null || submenu === null) {
            throw new Error("missing boxes");
        }
        expect(submenu.x + submenu.width).toBeLessThanOrEqual(share.x + 2);
        await page.keyboard.press("ArrowRight");
        await expect(menu(page, "Share")).toBeHidden();
        await expect(item(page, "Share")).toBeFocused();
    });
});

test.describe("menubar / vertical", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/menubar/vertical");
    });

    test("a vertical menubar, one tab stop", async ({ page }) => {
        await expect(bar(page, "Tools")).toHaveAttribute(
            "aria-orientation",
            "vertical",
        );
        await page.keyboard.press("Tab");
        await expect(item(page, "Shapes")).toBeFocused();
        await step(page, "Tab", button(page, "After"));
    });

    test("ArrowDown and ArrowUp move without wrapping; Home and End", async ({
        page,
    }) => {
        await item(page, "Shapes").focus();
        await step(page, "ArrowDown", item(page, "Arrange"));
        await step(page, "ArrowDown", item(page, "Arrange"));
        await step(page, "ArrowUp", item(page, "Shapes"));
        await step(page, "ArrowUp", item(page, "Shapes"));
        await step(page, "End", item(page, "Arrange"));
        await step(page, "Home", item(page, "Shapes"));
        await expectOutput(page, "menu", "none");
        await expect(openMenus(page)).toHaveCount(0);
    });

    test("ArrowRight opens a menu at the item's end side; ArrowLeft closes it back to the item", async ({
        page,
    }) => {
        const shapes = item(page, "Shapes");
        await shapes.focus();
        await page.keyboard.press("ArrowRight");
        await expect(menu(page, "Shapes")).toBeVisible();
        await expect(item(page, "Rectangle")).toBeFocused();
        await expectOutput(page, "reason", "list-navigation");
        const trigger = await shapes.boundingBox();
        const popup = await menu(page, "Shapes").boundingBox();
        if (trigger === null || popup === null) {
            throw new Error("missing boxes");
        }
        expect(popup.x).toBeGreaterThanOrEqual(trigger.x + trigger.width - 2);
        // an item with no submenu: the open key does nothing
        await page.keyboard.press("ArrowRight");
        await expect(item(page, "Rectangle")).toBeFocused();
        await expect(menu(page, "Shapes")).toBeVisible();
        await page.keyboard.press("ArrowLeft");
        await expect(menu(page, "Shapes")).toBeHidden();
        await expectOutput(page, "menu", "none");
        await expect(shapes).toBeFocused();
    });

    test("Enter opens on the first item; activating it returns to the bar", async ({
        page,
    }) => {
        await item(page, "Arrange").focus();
        await page.keyboard.press("Enter");
        await expect(item(page, "Bring forward")).toBeFocused();
        await page.keyboard.press("Enter");
        await expectOutput(page, "action", "Bring forward");
        await expect(menu(page, "Arrange")).toBeHidden();
        await expect(item(page, "Arrange")).toBeFocused();
    });

    test("has no axe violation with a menu open", async ({ page }) => {
        await item(page, "Shapes").focus();
        await page.keyboard.press("ArrowRight");
        await expect(menu(page, "Shapes")).toBeVisible();
        await expectNoAxeViolations(page);
    });
});

test.describe("menubar / modal", () => {
    const outside = (page: Page) => button(page, "Outside button");

    /** A press at the centre of the element, wherever the pointer events go (no hit check). */
    async function pressAt(page: Page, target: Locator) {
        const box = await target.boundingBox();
        if (box === null) {
            throw new Error("missing box");
        }
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }

    async function wheelScrolls(page: Page): Promise<boolean> {
        await page.mouse.move(10, 400);
        await page.mouse.wheel(0, 600);
        await page.waitForTimeout(200);
        return page.evaluate(() => window.scrollY > 0);
    }

    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/menubar/modal");
    });

    test("the page does not scroll while a menu is open; the bar still takes the pointer", async ({
        page,
    }) => {
        await item(page, "File").click();
        await expect(menu(page, "File")).toBeVisible();
        expect(await wheelScrolls(page)).toBe(false);
        await item(page, "Edit").hover();
        await expect(menu(page, "Edit")).toBeVisible();
        await expect(menu(page, "File")).toBeHidden();
        await expectOutput(page, "menu", "Edit");
        await expectOutput(page, "reason", "trigger-hover");
    });

    test("an outside press only closes: it reaches no element, focus returns to the item", async ({
        page,
    }) => {
        await item(page, "File").click();
        await item(page, "Edit").hover();
        await expect(menu(page, "Edit")).toBeVisible();
        await pressAt(page, outside(page));
        await expect(menu(page, "Edit")).toBeHidden();
        await expectOutput(page, "reason", "outside-press");
        await expectOutput(page, "outside", "none");
        await expect(outside(page)).not.toBeFocused();
        await expect(item(page, "Edit")).toBeFocused();
    });

    test("once closed, the page takes the pointer and scrolls again", async ({
        page,
    }) => {
        await item(page, "File").click();
        await expect(menu(page, "File")).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(menu(page, "File")).toBeHidden();
        await outside(page).click();
        await expectOutput(page, "outside", "pressed");
        expect(await wheelScrolls(page)).toBe(true);
    });
});

// Epic #49 review, spec/menubar.md "Pointer": a tap's pointer entering an item is no hover
test.describe("menubar / basic, touch", () => {
    test.use({ hasTouch: true });

    test("a tap on another item while a menu is open is a press, not a hover switch", async ({
        page,
    }) => {
        await openScenario(page, "/menubar/basic");
        await tap(page, item(page, "File"));
        await expect(menu(page, "File")).toBeVisible();
        await expectOutput(page, "reason", "trigger-press");
        await tap(page, item(page, "Edit"));
        await expect(menu(page, "Edit")).toBeVisible();
        await expect(menu(page, "File")).toBeHidden();
        await expectOutput(page, "menu", "Edit");
        await expectOutput(page, "reason", "trigger-press");
    });
});
