import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";
import { holdTouch } from "../../src/touch.ts";

// spec/context-menu.md
const button = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true });
const menu = (page: Page) => page.getByRole("menu", { name: "File actions" });
const item = (page: Page, name: string) =>
    page.getByRole("menuitem", { name, exact: true });
const area = (page: Page) =>
    page.locator('[data-primitives-part="context-menu-trigger"]');

/** A point inside the area, from its top-left corner. */
async function inArea(page: Page, dx: number, dy: number) {
    const box = await area(page).boundingBox();
    expect(box).not.toBeNull();
    const { x, y } = box as NonNullable<typeof box>;
    return { x: Math.round(x + dx), y: Math.round(y + dy) };
}

async function box(locator: Locator) {
    const rect = await locator.boundingBox();
    expect(rect).not.toBeNull();
    return rect as NonNullable<typeof rect>;
}

/** Whether the last `contextmenu` event's default was prevented (the browser's menu). */
async function watchContextMenu(page: Page) {
    await page.evaluate(() => {
        document.addEventListener("contextmenu", (event) => {
            (window as unknown as { prevented: boolean }).prevented =
                event.defaultPrevented;
        });
    });
}
const prevented = (page: Page) =>
    page.evaluate(
        () => (window as unknown as { prevented?: boolean }).prevented,
    );

test.describe("context-menu / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/context-menu/basic");
    });

    test("a right-click opens it at the pointer, focused, with no item highlighted", async ({
        page,
    }) => {
        await watchContextMenu(page);
        const point = await inArea(page, 40, 40);
        await page.mouse.click(point.x, point.y, { button: "right" });
        await expect(menu(page)).toBeVisible();
        await expectOutput(page, "open", "true");
        await expectOutput(page, "reason", "trigger-press");
        expect(await prevented(page)).toBe(true);
        const popup = await box(menu(page));
        expect(Math.abs(popup.x - point.x)).toBeLessThanOrEqual(1);
        expect(Math.abs(popup.y - point.y)).toBeLessThanOrEqual(1);
        await expect(menu(page)).toBeFocused();
        await expect(page.locator("[data-highlighted]")).toHaveCount(0);
    });

    test("the mouseup of the right-click activates nothing; a right-click inside the menu neither", async ({
        page,
    }) => {
        await watchContextMenu(page);
        const point = await inArea(page, 40, 40);
        await page.mouse.click(point.x, point.y, { button: "right" });
        await expect(menu(page)).toBeVisible();
        await expectOutput(page, "action", "none");
        await item(page, "Open").click({ button: "right" });
        await page.waitForTimeout(100);
        expect(await prevented(page)).toBe(true);
        await expect(menu(page)).toBeVisible();
        await expectOutput(page, "action", "none");
        await expectOutput(page, "open", "true");
    });

    test("a right-click elsewhere in the area moves it there", async ({
        page,
    }) => {
        const first = await inArea(page, 40, 40);
        await page.mouse.click(first.x, first.y, { button: "right" });
        await expect(menu(page)).toBeVisible();
        const second = await inArea(page, 300, 150);
        await page.mouse.click(second.x, second.y, { button: "right" });
        await expectOutput(page, "open", "true");
        await expectOutput(page, "reason", "trigger-press");
        await expect(menu(page)).toBeVisible();
        await expect
            .poll(async () => {
                const popup = await box(menu(page));
                return (
                    Math.abs(popup.x - second.x) <= 1 &&
                    Math.abs(popup.y - second.y) <= 1
                );
            })
            .toBe(true);
    });

    test("an item activates from the keyboard and closes it", async ({
        page,
    }) => {
        const point = await inArea(page, 40, 40);
        await page.mouse.click(point.x, point.y, { button: "right" });
        await expect(menu(page)).toBeFocused();
        await page.keyboard.press("ArrowDown");
        await expect(item(page, "Open")).toBeFocused();
        await page.keyboard.press("Enter");
        await expectOutput(page, "action", "Open");
        await expectOutput(page, "open", "false");
        await expectOutput(page, "reason", "item-press");
        await expect(menu(page)).toHaveCount(0);
    });

    test("Shift+F10 opens it below the focused element, first item focused; Escape returns focus", async ({
        page,
    }) => {
        const report = button(page, "report.pdf");
        await report.focus();
        await page.keyboard.press("Shift+F10");
        await expect(menu(page)).toBeVisible();
        await expectOutput(page, "reason", "list-navigation");
        await expect(item(page, "Open")).toBeFocused();
        const anchor = await box(report);
        const popup = await box(menu(page));
        expect(
            Math.abs(popup.y - (anchor.y + anchor.height)),
        ).toBeLessThanOrEqual(1);
        expect(Math.abs(popup.x - anchor.x)).toBeLessThanOrEqual(1);
        await page.keyboard.press("Escape");
        await expect(menu(page)).toHaveCount(0);
        await expectOutput(page, "reason", "escape-key");
        await expect(report).toBeFocused();
    });

    test("the ContextMenu key opens it below the focused element, once", async ({
        page,
    }) => {
        const notes = button(page, "notes.txt");
        await notes.focus();
        await page.keyboard.press("ContextMenu");
        await expect(menu(page)).toBeVisible();
        await expect(item(page, "Open")).toBeFocused();
        await page.waitForTimeout(100);
        // the key's own contextmenu event did not move it to another point
        const anchor = await box(notes);
        const popup = await box(menu(page));
        expect(
            Math.abs(popup.y - (anchor.y + anchor.height)),
        ).toBeLessThanOrEqual(1);
        expect(Math.abs(popup.x - anchor.x)).toBeLessThanOrEqual(1);
        await expect(item(page, "Open")).toBeFocused();
    });

    test("its submenu opens from the keyboard, and its items close every level", async ({
        page,
    }) => {
        await button(page, "report.pdf").focus();
        await page.keyboard.press("Shift+F10");
        await expect(item(page, "Open")).toBeFocused();
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowDown");
        await expect(
            page.getByRole("menuitem", { name: "Share" }),
        ).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(page.getByRole("menu", { name: "Share" })).toBeVisible();
        await expect(item(page, "Email")).toBeFocused();
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await expectOutput(page, "action", "Link");
        await expectOutput(page, "open", "false");
        await expect(page.getByRole("menu")).toHaveCount(0);
    });

    test("a right-click on a focusable element gives it the focus back on Escape", async ({
        page,
    }) => {
        await button(page, "report.pdf").click({ button: "right" });
        await expect(menu(page)).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(menu(page)).toHaveCount(0);
        await expect(button(page, "report.pdf")).toBeFocused();
    });

    test("an outside press closes it and reaches the page", async ({
        page,
    }) => {
        const point = await inArea(page, 40, 40);
        await page.mouse.click(point.x, point.y, { button: "right" });
        await expect(menu(page)).toBeVisible();
        await button(page, "After area").click();
        await expect(menu(page)).toHaveCount(0);
        await expectOutput(page, "reason", "outside-press");
        await expect(button(page, "After area")).toBeFocused();
    });

    test("Tab closes it and moves on from the element focused when it opened", async ({
        page,
    }) => {
        await button(page, "report.pdf").focus();
        await page.keyboard.press("Shift+F10");
        await expect(item(page, "Open")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(menu(page)).toHaveCount(0);
        await expectOutput(page, "reason", "focus-out");
        await expect(button(page, "notes.txt")).toBeFocused();
    });

    test("has no axe violation while open", async ({ page }) => {
        const point = await inArea(page, 40, 40);
        await page.mouse.click(point.x, point.y, { button: "right" });
        await expect(menu(page)).toBeVisible();
        await expectNoAxeViolations(page);
    });
});

test.describe("context-menu / basic, touch", () => {
    test.use({ hasTouch: true });

    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/context-menu/basic");
    });

    test("a long press opens it at the press point, and its release activates nothing", async ({
        page,
    }) => {
        const point = await inArea(page, 40, 40);
        await holdTouch(page, point, 600);
        await expect(menu(page)).toBeVisible();
        await expectOutput(page, "reason", "trigger-press");
        const popup = await box(menu(page));
        expect(Math.abs(popup.x - point.x)).toBeLessThanOrEqual(1);
        expect(Math.abs(popup.y - point.y)).toBeLessThanOrEqual(1);
        await page.waitForTimeout(200);
        await expect(menu(page)).toBeVisible();
        await expectOutput(page, "action", "none");
    });

    test("a short press opens nothing", async ({ page }) => {
        await holdTouch(page, await inArea(page, 40, 40), 200);
        await page.waitForTimeout(600);
        await expect(page.getByRole("menu")).toHaveCount(0);
        await expectOutput(page, "open", "false");
    });

    test("a press that moves before the delay opens nothing", async ({
        page,
    }) => {
        await holdTouch(page, await inArea(page, 40, 40), 600, 30);
        await page.waitForTimeout(200);
        await expect(page.getByRole("menu")).toHaveCount(0);
        await expectOutput(page, "open", "false");
    });
});

test.describe("context-menu / rtl", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/context-menu/rtl", { dir: "rtl" });
    });

    test("the popup's start corner (its right edge) is at the point", async ({
        page,
    }) => {
        const point = await inArea(page, 200, 40);
        await page.mouse.click(point.x, point.y, { button: "right" });
        await expect(menu(page)).toBeVisible();
        const popup = await box(menu(page));
        expect(Math.abs(popup.x + popup.width - point.x)).toBeLessThanOrEqual(
            1,
        );
        expect(Math.abs(popup.y - point.y)).toBeLessThanOrEqual(1);
    });

    test("ArrowLeft opens the submenu to the left, ArrowRight closes it", async ({
        page,
    }) => {
        await button(page, "report.pdf").focus();
        await page.keyboard.press("Shift+F10");
        await expect(item(page, "Open")).toBeFocused();
        await page.keyboard.press("End");
        await expect(
            page.getByRole("menuitem", { name: "Share" }),
        ).toBeFocused();
        await page.keyboard.press("ArrowLeft");
        const submenu = page.getByRole("menu", { name: "Share" });
        await expect(submenu).toBeVisible();
        const trigger = await box(
            page.getByRole("menuitem", { name: "Share" }),
        );
        const popup = await box(submenu);
        expect(popup.x + popup.width).toBeLessThanOrEqual(trigger.x + 1);
        await page.keyboard.press("ArrowRight");
        await expect(submenu).toHaveCount(0);
        await expect(
            page.getByRole("menuitem", { name: "Share" }),
        ).toBeFocused();
    });
});
