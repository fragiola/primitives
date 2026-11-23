import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// toggle: a track's actions (spec/toggle.md). Toggles "Favourite" (controlled, released),
// "Mute" (pressed at first) and "Download" (disabled), each named by its text.

test("a click, Enter and Space press and release a toggle; the disabled one ignores them", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "toggle" });
    const toggle = (name: string) => frame.getByRole("button", { name });
    await expect(toggle("Favourite")).toHaveAttribute(
        "data-primitives-part",
        "toggle-root",
    );
    await expect(toggle("Favourite")).toHaveAttribute("aria-pressed", "false");
    await expect(toggle("Mute")).toHaveAttribute("aria-pressed", "true");
    await expect(toggle("Mute")).toHaveAttribute("data-pressed", "");
    await expect(toggle("Download")).toBeDisabled();
    await expect(frame.getByText("Not in your favourites")).toBeVisible();

    await toggle("Favourite").click();
    await expect(toggle("Favourite")).toHaveAttribute("aria-pressed", "true");
    await expect(frame.getByText("In your favourites")).toBeVisible();
    // the name never changes with the state
    await expect(toggle("Favourite")).toHaveCount(1);
    await page.keyboard.press("Enter");
    await expect(toggle("Favourite")).toHaveAttribute("aria-pressed", "false");
    await page.keyboard.press("Space");
    await expect(toggle("Favourite")).toHaveAttribute("aria-pressed", "true");

    await toggle("Mute").focus();
    await page.keyboard.press("Space");
    await expect(toggle("Mute")).toHaveAttribute("aria-pressed", "false");
    await expect(toggle("Mute")).not.toHaveAttribute("data-pressed");

    await toggle("Download").click({ force: true });
    await expect(toggle("Download")).toHaveAttribute("aria-pressed", "false");
    expect(errors).toEqual([]);
});

test("each toggle is a tab stop, the disabled one is skipped", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "toggle" });
    const toggle = (name: string) => frame.getByRole("button", { name });
    await toggle("Favourite").focus();
    await page.keyboard.press("Tab");
    await expect(toggle("Mute")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(toggle("Download")).not.toBeFocused();
    await expect(toggle("Mute")).not.toBeFocused();
    await toggle("Mute").focus();
    await page.keyboard.press("Shift+Tab");
    await expect(toggle("Favourite")).toBeFocused();
});

test("axe finds no violation, at rest and pressed", async ({ page }) => {
    requireExamples("toggle");
    await page.goto(`${EMBED_BASE}?id=toggle`);
    await expect(page.getByRole("button")).toHaveCount(3);
    expect(await axeViolations(page)).toEqual([]);
    await page.getByRole("button", { name: "Favourite" }).click();
    await expect(
        page.getByRole("button", { name: "Favourite" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(await axeViolations(page)).toEqual([]);
});
