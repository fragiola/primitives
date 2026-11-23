import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    promoted,
    requireExamples,
} from "../helpers.ts";

// hover-card: the profile preview (spec/hover-card.md). A non-modal card: never promoted.

const card = '[data-primitives-part="hover-card-popup"]';

test("hovering the link shows the profile; leaving closes it", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "hover-card" });
    const link = frame.getByRole("link", { name: "@ada" });
    await expect(link).toHaveAttribute(
        "data-primitives-part",
        "hover-card-trigger",
    );
    await link.hover();
    const popup = frame.locator(card);
    await expect(popup).toBeVisible();
    await expect(popup).toContainText("Ada Lovelace");
    await expect(link).toHaveAttribute("data-popup-open", "");
    expect(await promoted(page)).toBe(false);
    await page.mouse.move(5, 5);
    await expect(popup).toBeHidden();
    expect(errors).toEqual([]);
});

test("keyboard focus shows it, focus stays on the link; Escape closes it", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "hover-card" });
    const link = frame.getByRole("link", { name: "@ada" });
    await link.focus();
    const popup = frame.locator(card);
    await expect(popup).toBeVisible();
    await expect(link).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(popup).toBeHidden();
    await expect(link).toBeFocused();
});

test("axe finds no violation with the card open", async ({ page }) => {
    requireExamples("hover-card");
    await page.goto(`${EMBED_BASE}?id=hover-card`);
    await page.getByRole("link", { name: "@ada" }).hover();
    await expect(page.locator(card)).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
