import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    part,
    requireExamples,
} from "../helpers.ts";

// aspect-ratio: an image frame (spec/aspect-ratio.md). A 16:9 AspectRatio holding an image
// "Hills under the sun", and a caption.

test("the frame keeps 16:9", async ({ page }) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "aspect-ratio" });
    const box = await frame.locator(part("aspect-ratio-root")).boundingBox();
    expect(box).not.toBeNull();
    const { width, height } = box as NonNullable<typeof box>;
    expect(width / height).toBeCloseTo(16 / 9, 1);
    await expect(
        frame.getByRole("img", { name: "Hills under the sun" }),
    ).toBeVisible();
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("aspect-ratio");
    await page.goto(`${EMBED_BASE}?id=aspect-ratio`);
    await expect(
        page.getByRole("img", { name: "Hills under the sun" }),
    ).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
