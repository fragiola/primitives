import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// tooltip: the toolbar hints (spec/tooltip.md). A tooltip is no layer: never promoted.

test("hover opens a tooltip that describes its button; the next one opens at once", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "tooltip" });
    const bold = frame.getByRole("button", { name: "Bold", exact: true });
    await expect(bold).toHaveAttribute(
        "data-primitives-part",
        "tooltip-trigger",
    );
    await bold.hover();
    const hint = frame.getByRole("tooltip", { name: "Bold (Ctrl+B)" });
    await expect(hint).toBeVisible();
    await expect(bold).toHaveAccessibleDescription("Bold (Ctrl+B)");
    await expect(bold).toHaveAttribute("data-popup-open", "");

    await frame.getByRole("button", { name: "Italic", exact: true }).hover();
    const italic = frame.getByRole("tooltip", { name: "Italic (Ctrl+I)" });
    await expect(italic).toBeVisible({ timeout: 400 });
    await expect(italic).toHaveAttribute("data-instant", "");
    await expect(frame.getByRole("tooltip")).toHaveCount(1);
    expect(errors).toEqual([]);
});

test("keyboard focus opens it at once, Escape closes it", async ({ page }) => {
    const frame = await openHosted(page, { id: "tooltip" });
    const bold = frame.getByRole("button", { name: "Bold", exact: true });
    await bold.focus();
    await page.keyboard.press("Tab");
    const italic = frame.getByRole("button", { name: "Italic", exact: true });
    await expect(italic).toBeFocused();
    await expect(
        frame.getByRole("tooltip", { name: "Italic (Ctrl+I)" }),
    ).toBeVisible({ timeout: 400 });
    await page.keyboard.press("Escape");
    await expect(frame.getByRole("tooltip")).toHaveCount(0);
    await expect(italic).toBeFocused();
});

test("axe finds no violation with a tooltip open", async ({ page }) => {
    requireExamples("tooltip");
    await page.goto(`${EMBED_BASE}?id=tooltip`);
    await page.getByRole("button", { name: "Bold", exact: true }).hover();
    await expect(page.getByRole("tooltip")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
