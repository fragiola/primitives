import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    promoted,
    requireExamples,
    settleAnimations,
} from "../helpers.ts";

// navigation-menu: the site header (spec/navigation-menu.md). Non-modal: never promoted.

test("a hover discloses a panel, another Trigger switches it, leaving closes it", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "navigation-menu" });
    await expect(frame.getByRole("navigation", { name: "Main" })).toBeVisible();
    const products = frame.getByRole("button", { name: "Products" });
    const resources = frame.getByRole("button", { name: "Resources" });
    await expect(products).toHaveAttribute("aria-expanded", "false");
    await expect(products).toHaveAttribute(
        "data-primitives-part",
        "navigation-menu-trigger",
    );
    await products.hover();
    await expect(products).toHaveAttribute("aria-expanded", "true");
    await expect(frame.getByRole("link", { name: /Analytics/ })).toBeVisible();
    await resources.hover();
    await expect(resources).toHaveAttribute("aria-expanded", "true");
    await expect(products).toHaveAttribute("aria-expanded", "false");
    await expect(frame.getByRole("link", { name: /Guides/ })).toBeVisible();
    expect(await promoted(page)).toBe(false);
    // away inside the frame (a pointer that leaves the frame sends it no move)
    const body = await frame.locator("body").boundingBox();
    if (body === null) throw new Error("no frame");
    await page.mouse.move(body.x + 8, body.y + body.height - 8);
    await expect(resources).toHaveAttribute("aria-expanded", "false");
    expect(errors).toEqual([]);
});

test("the keyboard: arrows between the items, ArrowDown into a panel, Escape back", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "navigation-menu" });
    const products = frame.getByRole("button", { name: "Products" });
    await products.focus();
    await page.keyboard.press("ArrowRight");
    await expect(
        frame.getByRole("button", { name: "Resources" }),
    ).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(frame.getByRole("link", { name: "Pricing" })).toBeFocused();
    await page.keyboard.press("Home");
    await expect(products).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(products).toHaveAttribute("aria-expanded", "true");
    await expect(products).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(products).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press("ArrowDown");
    await expect(frame.getByRole("link", { name: /Analytics/ })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(products).toHaveAttribute("aria-expanded", "false");
    await expect(products).toBeFocused();
});

test("a press opens a panel and a second press closes it", async ({ page }) => {
    const frame = await openHosted(page, { id: "navigation-menu" });
    await page.mouse.move(2, 2);
    const resources = frame.getByRole("button", { name: "Resources" });
    await resources.click();
    await expect(resources).toHaveAttribute("aria-expanded", "true");
    await page.waitForTimeout(600);
    await resources.click();
    await expect(resources).toHaveAttribute("aria-expanded", "false");
});

test("axe finds no violation with a panel open", async ({ page }) => {
    requireExamples("navigation-menu");
    await page.goto(`${EMBED_BASE}?id=navigation-menu`);
    await page.getByRole("button", { name: "Products" }).click();
    await expect(page.getByRole("link", { name: /Analytics/ })).toBeVisible();
    await settleAnimations(page);
    expect(await axeViolations(page)).toEqual([]);
});
