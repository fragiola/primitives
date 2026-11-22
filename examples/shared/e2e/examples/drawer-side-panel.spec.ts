import { expect, type Locator, type Page, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    promoted,
    requireExamples,
    settleAnimations,
    settleAnimationsOf,
} from "../helpers.ts";

// drawer-side-panel: the cart at the right edge (spec/drawer.md, `swipeDirection="right"`). A
// modal overlay, promoted as a dialog.

/** A slow mouse drag from the centre of `from` by `dx` px (5 px per 20 ms: no flick). */
async function dragRight(page: Page, from: Locator, dx: number) {
    const box = await from.boundingBox();
    if (box === null) throw new Error("no box");
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let moved = 5; moved <= dx; moved += 5) {
        await page.mouse.move(x + moved, y);
        await page.waitForTimeout(20);
    }
    await page.mouse.up();
}

test("opens the cart at the right edge; Continue shopping closes it", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "drawer-side-panel" });
    const trigger = frame.getByRole("button", { name: "Cart (2)" });
    await trigger.click();
    const panel = frame.getByRole("dialog", { name: "Your cart" });
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("data-swipe-direction", "right");
    await expect.poll(() => promoted(page)).toBe(true);
    await frame.getByRole("button", { name: "Remove Notebook" }).click();
    await expect(frame.getByText("1 items, ready to check out.")).toBeVisible();
    await frame.getByRole("button", { name: "Continue shopping" }).click();
    await expect(panel).toHaveCount(0);
    await expect(frame.getByRole("button", { name: "Cart (1)" })).toBeFocused();
    await expect.poll(() => promoted(page)).toBe(false);
    expect(errors).toEqual([]);
});

test("a swipe to the right dismisses it; Escape too", async ({ page }) => {
    const frame = await openHosted(page, { id: "drawer-side-panel" });
    const trigger = frame.getByRole("button", { name: "Cart (2)" });
    await trigger.click();
    const panel = frame.getByRole("dialog", { name: "Your cart" });
    await expect(panel).toBeVisible();
    await settleAnimationsOf(panel);
    const width = (await panel.boundingBox())?.width ?? 0;
    await dragRight(
        page,
        frame.getByRole("heading", { name: "Your cart" }),
        Math.round(width * 0.7),
    );
    await expect(panel).toHaveCount(0);
    await trigger.click();
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(trigger).toBeFocused();
});

test("axe finds no violation with the cart open", async ({ page }) => {
    requireExamples("drawer-side-panel");
    await page.goto(`${EMBED_BASE}?id=drawer-side-panel`);
    await page.getByRole("button", { name: "Cart (2)" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await settleAnimations(page);
    expect(await axeViolations(page)).toEqual([]);
});
