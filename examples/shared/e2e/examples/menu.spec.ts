import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
    collectErrors,
    EMBED_BASE,
    openHosted,
    promoted,
    requireExamples,
    WCAG,
} from "../helpers.ts";

// menu: the "File" menu with its "Share" submenu (spec/menu.md). Non-modal: never promoted.

test("the keyboard opens, moves, enters the submenu and closes one level at a time", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "menu" });
    const trigger = frame.getByRole("button", { name: "File" });
    const item = (name: string) => frame.getByRole("menuitem", { name });
    await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await expect(trigger).toHaveAttribute(
        "data-primitives-part",
        "menu-trigger",
    );

    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    const menu = frame.getByRole("menu", { name: "File" });
    await expect(menu).toBeVisible();
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    await expect(item("New file")).toBeFocused();
    expect(await promoted(page)).toBe(false);

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(item("Share")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(frame.getByRole("menu", { name: "Share" })).toBeVisible();
    await expect(item("Email")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(frame.getByRole("menu", { name: "Share" })).toHaveCount(0);
    await expect(item("Share")).toBeFocused();

    // a disabled item stays focusable
    await page.keyboard.press("ArrowDown");
    await expect(item("Export")).toBeFocused();
    await expect(item("Export")).toHaveAttribute("aria-disabled", "true");

    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
});

test("a click on an item closes every level", async ({ page }) => {
    const frame = await openHosted(page, { id: "menu" });
    await frame.getByRole("button", { name: "File" }).click();
    await frame.getByRole("menuitem", { name: "Share" }).hover();
    await expect(frame.getByRole("menu", { name: "Share" })).toBeVisible();
    await frame.getByRole("menuitem", { name: "Copy link" }).click();
    await expect(frame.getByRole("menu")).toHaveCount(0);
});

test("axe finds no violation with the menu open", async ({ page }) => {
    requireExamples("menu");
    await page.goto(`${EMBED_BASE}?id=menu`);
    await page.getByRole("button", { name: "File" }).click();
    await expect(page.getByRole("menu")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(results.violations).toEqual([]);
});
