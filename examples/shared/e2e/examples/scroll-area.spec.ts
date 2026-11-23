import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    part,
    requireExamples,
} from "../helpers.ts";

// scroll-area: a sidebar of channel links (spec/scroll-area.md). Forty links "# channel-<n>" in a
// ScrollArea with one vertical Scrollbar; the links take the focus, so the viewport has no tab stop.

test("the list scrolls and the thumb follows it", async ({ page }) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "scroll-area" });
    const viewport = frame.locator(part("scroll-area-viewport"));
    await expect(viewport).toBeVisible();
    await expect(viewport).not.toHaveAttribute("tabindex");
    const root = frame.locator(part("scroll-area-root"));
    await expect(root).toHaveAttribute("data-has-overflow-y", "");
    await expect(root).toHaveAttribute("data-overflow-y-end", "");
    const thumb = frame.locator(part("scroll-area-thumb"));
    await expect(thumb).toHaveCount(1);
    await frame.getByRole("link", { name: "# channel-40" }).focus();
    await expect(root).toHaveAttribute("data-overflow-y-start", "");
    await expect(root).not.toHaveAttribute("data-overflow-y-end");
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("scroll-area");
    await page.goto(`${EMBED_BASE}?id=scroll-area`);
    await expect(
        page.getByRole("link", { name: "# channel-1", exact: true }),
    ).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
