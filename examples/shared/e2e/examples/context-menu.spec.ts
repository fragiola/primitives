import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    promoted,
    requireExamples,
} from "../helpers.ts";

// context-menu: the file manager (spec/context-menu.md). Non-modal: never promoted.

test("a right-click on a file opens the menu at the pointer; an item acts on that file", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "context-menu" });
    const file = frame.getByRole("button", { name: "notes.txt" });
    const box = await file.boundingBox();
    expect(box).not.toBeNull();
    const { x, y } = box as NonNullable<typeof box>;
    await page.mouse.click(Math.round(x + 20), Math.round(y + 8), {
        button: "right",
    });
    const menu = frame.getByRole("menu", { name: "File actions" });
    await expect(menu).toBeVisible();
    const popup = await menu.boundingBox();
    expect(Math.abs((popup?.x ?? 0) - Math.round(x + 20))).toBeLessThanOrEqual(
        1,
    );
    expect(Math.abs((popup?.y ?? 0) - Math.round(y + 8))).toBeLessThanOrEqual(
        1,
    );
    await expect(menu).toHaveAttribute(
        "data-primitives-part",
        "context-menu-popup",
    );
    expect(await promoted(page)).toBe(false);
    await frame.getByRole("menuitem", { name: "Rename" }).click();
    await expect(menu).toHaveCount(0);
    await expect(frame.getByText("Renamed: notes.txt")).toBeVisible();
    expect(errors).toEqual([]);
});

test("Shift+F10 opens it from the keyboard; the Share submenu works", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "context-menu" });
    const file = frame.getByRole("button", { name: "photo.png" });
    await file.focus();
    await page.keyboard.press("Shift+F10");
    await expect(
        frame.getByRole("menu", { name: "File actions" }),
    ).toBeVisible();
    await expect(frame.getByRole("menuitem", { name: "Open" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await expect(frame.getByRole("menu", { name: "Share" })).toBeVisible();
    await expect(frame.getByRole("menuitem", { name: "Email" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(frame.getByRole("menu")).toHaveCount(0);
    await expect(frame.getByText("Link copied: photo.png")).toBeVisible();
    await expect(file).toBeFocused();
});

test("axe finds no violation with the menu open", async ({ page }) => {
    requireExamples("context-menu");
    await page.goto(`${EMBED_BASE}?id=context-menu`);
    await page.getByRole("button", { name: "report.pdf" }).focus();
    await page.keyboard.press("Shift+F10");
    await expect(page.getByRole("menu")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
