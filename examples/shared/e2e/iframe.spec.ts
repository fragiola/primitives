// Adapted from Tree (fragiola/tree, examples/shared/e2e/iframe.spec.ts), same author and licence.
import { expect, test } from "@playwright/test";
import { messages, openHosted, sendTheme } from "./helpers.ts";

// The embed protocol (site export contract v1.7, §5.1 and §5.2), checked on the Tabs example:
// `ready` once, no `resize` for a fill layout, the theme before the first paint and from the
// site's message, the fallback theme, an unknown example, `noindex`.

test("the embed says ready once, with no resize for a fill layout", async ({
    page,
}) => {
    await openHosted(page, { id: "tabs", theme: "dark" });
    await expect(page.getByTestId("frame")).toHaveCSS("opacity", "1");
    await page.waitForTimeout(300);
    expect(await messages(page)).toEqual([
        { type: "fragiola:example:ready", id: "tabs" },
    ]);
});

test("the theme follows the site's message; an unknown one is ignored", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "tabs", theme: "light" });
    const body = frame.locator("body");
    const html = frame.locator("html");
    const color = () =>
        frame
            .locator('[data-primitives-part="tabs-root"]')
            .evaluate((el) => getComputedStyle(el).color);
    const before = await color();

    await sendTheme(page, "terminal");
    await expect(body).toHaveAttribute("data-example-theme", "terminal");
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(html).toHaveClass(/\bdark\b/);
    await expect.poll(color).not.toBe(before);

    await sendTheme(page, "nope");
    await page.waitForTimeout(100);
    await expect(body).toHaveAttribute("data-example-theme", "terminal");
});

test("a missing or unknown theme falls back to light", async ({ page }) => {
    for (const query of [{ id: "tabs" }, { id: "tabs", theme: "nope" }]) {
        const frame = await openHosted(page, query);
        await expect(frame.locator("body")).toHaveAttribute(
            "data-example-theme",
            "light",
        );
        await expect(frame.locator("html")).toHaveAttribute(
            "data-theme",
            "light",
        );
    }
});

test("an unknown example says so, and is still ready", async ({ page }) => {
    await page.goto("/host.html?id=nope");
    const frame = page.frameLocator('[data-testid="frame"]');
    await expect(frame.getByRole("alert")).toHaveText('Unknown example "nope"');
    await expect
        .poll(() => messages(page))
        .toContainEqual({ type: "fragiola:example:ready", id: "nope" });
});

test("the embed is not for search engines", async ({ page }) => {
    const frame = await openHosted(page, { id: "tabs" });
    await expect(frame.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        "noindex",
    );
});
