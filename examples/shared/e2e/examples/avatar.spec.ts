import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    part,
    requireExamples,
} from "../helpers.ts";

// avatar: team avatars (spec/avatar.md). An Avatar with an inline image "Ada Lovelace" and the
// initials "AL", one whose image "Grace Hopper" is broken (data that is no image) with "GH", and one with no image
// and the initials "KJ" after a 300 ms delay.

test("a loaded image replaces its initials; a broken one never shows", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "avatar" });
    await expect(frame.locator(part("avatar-root"))).toHaveCount(3);
    await expect(
        frame.getByRole("img", { name: "Ada Lovelace" }),
    ).toBeVisible();
    await expect(frame.getByText("AL", { exact: true })).toHaveCount(0);
    await expect(frame.getByText("GH", { exact: true })).toBeVisible();
    await expect(frame.getByRole("img", { name: "Grace Hopper" })).toHaveCount(
        0,
    );
    await expect(frame.getByText("KJ", { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("avatar");
    await page.goto(`${EMBED_BASE}?id=avatar`);
    await expect(page.getByText("KJ", { exact: true })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
