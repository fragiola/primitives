import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    part,
    requireExamples,
} from "../helpers.ts";

// toggle-group: text alignment (spec/toggle-group.md). A ToggleGroup "Text alignment" of the
// Toggles "Left" (pressed at first), "Center", "Right" and "Justify", and a paragraph whose
// `data-align` follows the value.

const NAMES = ["Left", "Center", "Right", "Justify"];

test("one toggle pressed at a time; pressing the pressed one releases it", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "toggle-group" });
    const group = frame.getByRole("group", { name: "Text alignment" });
    const toggle = (name: string) => group.getByRole("button", { name });
    const preview = frame.locator("p[data-align]");
    await expect(group).toHaveAttribute(
        "data-primitives-part",
        "toggle-group-root",
    );
    await expect(group).toHaveAttribute("data-orientation", "horizontal");
    await expect(group.getByRole("button")).toHaveCount(4);
    await expect(toggle("Left")).toHaveAttribute("aria-pressed", "true");
    for (const name of NAMES.slice(1)) {
        await expect(toggle(name)).toHaveAttribute("aria-pressed", "false");
    }
    await expect(preview).toHaveAttribute("data-align", "left");

    await toggle("Center").click();
    await expect(toggle("Center")).toHaveAttribute("aria-pressed", "true");
    await expect(toggle("Left")).toHaveAttribute("aria-pressed", "false");
    await expect(preview).toHaveAttribute("data-align", "center");
    await toggle("Center").click();
    await expect(toggle("Center")).toHaveAttribute("aria-pressed", "false");
    await expect(preview).toHaveAttribute("data-align", "start");

    await toggle("Right").focus();
    await page.keyboard.press("Space");
    await expect(toggle("Right")).toHaveAttribute("aria-pressed", "true");
    await expect(preview).toHaveAttribute("data-align", "right");
    await page.keyboard.press("Enter");
    await expect(toggle("Right")).toHaveAttribute("aria-pressed", "false");
    expect(errors).toEqual([]);
});

test("one tab stop: the arrows, Home and End move the focus, never the value", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "toggle-group" });
    const group = frame.getByRole("group", { name: "Text alignment" });
    const toggle = (name: string) => group.getByRole("button", { name });
    const tabStops = frame.locator(`${part("toggle-root")}[tabindex="0"]`);
    await expect(tabStops).toHaveCount(1);
    await expect(toggle("Left")).toHaveAttribute("tabindex", "0");

    await toggle("Left").focus();
    await page.keyboard.press("ArrowRight");
    await expect(toggle("Center")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(toggle("Right")).toBeFocused();
    await page.keyboard.press("End");
    await expect(toggle("Justify")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(toggle("Left")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(toggle("Justify")).toBeFocused();
    await page.keyboard.press("Home");
    await expect(toggle("Left")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(toggle("Left")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(toggle("Center")).toBeFocused();
    // the value never moved, and the focused toggle holds the one tab stop
    await expect(toggle("Left")).toHaveAttribute("aria-pressed", "true");
    await expect(toggle("Center")).toHaveAttribute("aria-pressed", "false");
    await expect(tabStops).toHaveCount(1);
    await expect(toggle("Center")).toHaveAttribute("tabindex", "0");
    // Tab leaves the group at once
    await page.keyboard.press("Tab");
    for (const name of NAMES) {
        await expect(toggle(name)).not.toBeFocused();
    }
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("toggle-group");
    await page.goto(`${EMBED_BASE}?id=toggle-group`);
    await expect(page.getByRole("group")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
