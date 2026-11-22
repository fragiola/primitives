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

// drawer: the "Share" bottom sheet (spec/drawer.md). A modal overlay: inside the site's frame it is
// promoted over the whole page, as a dialog.

/** A slow mouse drag from the centre of `from` by `dy` px (5 px per 20 ms: no flick). */
async function dragDown(page: Page, from: Locator, dy: number) {
    const box = await from.boundingBox();
    if (box === null) throw new Error("no box");
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let moved = 5; moved <= dy; moved += 5) {
        await page.mouse.move(x, y + moved);
        await page.waitForTimeout(20);
    }
    await page.mouse.up();
}

test("opens a modal sheet, promoted; Escape closes it, focus back on Share", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "drawer" });
    const trigger = frame.getByRole("button", { name: "Share" });
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await expect(trigger).toHaveAttribute(
        "data-primitives-part",
        "drawer-trigger",
    );
    await trigger.click();
    const sheet = frame.getByRole("dialog", { name: "Share" });
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute("aria-modal", "true");
    await expect(sheet).toHaveAttribute("data-swipe-direction", "down");
    await expect(
        frame.getByRole("button", { name: "Copy link" }),
    ).toBeFocused();
    await expect.poll(() => promoted(page)).toBe(true);
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect.poll(() => promoted(page)).toBe(false);
    expect(errors).toEqual([]);
});

test("a swipe down from its handle dismisses it; a target shares and closes it", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "drawer" });
    const trigger = frame.getByRole("button", { name: "Share" });
    await trigger.click();
    const sheet = frame.getByRole("dialog", { name: "Share" });
    await expect(sheet).toBeVisible();
    await settleAnimationsOf(sheet);
    const height = (await sheet.boundingBox())?.height ?? 0;
    await dragDown(
        page,
        sheet.locator(":scope > [aria-hidden]").first(),
        Math.round(height * 0.7),
    );
    await expect(sheet).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(frame.getByText("Not shared yet")).toBeVisible();

    await trigger.click();
    await frame.getByRole("button", { name: "Email" }).click();
    await expect(frame.getByRole("dialog")).toHaveCount(0);
    await expect(frame.getByText("Shared: Email")).toBeVisible();
});

test("axe finds no violation with the sheet open", async ({ page }) => {
    requireExamples("drawer");
    await page.goto(`${EMBED_BASE}?id=drawer`);
    await page.getByRole("button", { name: "Share" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await settleAnimations(page);
    expect(await axeViolations(page)).toEqual([]);
});
