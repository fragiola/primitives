import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    part,
    requireExamples,
} from "../helpers.ts";

// separator: a profile card (spec/separator.md). A horizontal Separator between its text and its
// links "Notes", "Letters" and "Engine", vertical Separators between the links, and a decorative
// Separator under them.

test("the separators are in the tree along their orientations, the decorative one is not", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "separator" });
    await expect(frame.locator(part("separator-root"))).toHaveCount(4);
    const separators = frame.getByRole("separator");
    await expect(separators).toHaveCount(3);
    await expect(separators.nth(0)).toHaveAttribute(
        "aria-orientation",
        "horizontal",
    );
    for (const index of [1, 2]) {
        await expect(separators.nth(index)).toHaveAttribute(
            "aria-orientation",
            "vertical",
        );
        const box = await separators.nth(index).boundingBox();
        expect(box?.height ?? 0).toBeGreaterThan(box?.width ?? 0);
    }
    await expect(frame.locator('[role="none"]')).toHaveCount(1);
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("separator");
    await page.goto(`${EMBED_BASE}?id=separator`);
    await expect(page.getByRole("separator")).toHaveCount(3);
    expect(await axeViolations(page)).toEqual([]);
});
