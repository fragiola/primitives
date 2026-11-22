import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    part,
    requireExamples,
} from "../helpers.ts";

// collapsible: a settings sidebar (spec/collapsible.md). Three sections, "Workspace" open, each a
// Trigger and a Panel of links, hidden until found while closed. A Collapsible opens no modal
// overlay: never promoted.

test("a section's button shows and hides its links", async ({ page }) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "collapsible" });
    const sidebar = frame.getByRole("navigation", { name: "Settings" });
    const button = (name: string) =>
        sidebar.getByRole("button", { name, exact: true });

    await expect(button("Workspace")).toHaveAttribute("aria-expanded", "true");
    await expect(sidebar.getByRole("link", { name: "Members" })).toBeVisible();
    await expect(button("Projects")).toHaveAttribute("aria-expanded", "false");
    await expect(sidebar.getByRole("link", { name: "Website" })).toBeHidden();

    await button("Projects").click();
    await expect(button("Projects")).toHaveAttribute("aria-expanded", "true");
    await expect(sidebar.getByRole("link", { name: "Website" })).toBeVisible();

    await button("Workspace").focus();
    await page.keyboard.press("Enter");
    await expect(button("Workspace")).toHaveAttribute("aria-expanded", "false");
    await expect(sidebar.getByRole("link", { name: "Members" })).toBeHidden();
    expect(errors).toEqual([]);
});

test("a closed section is hidden until found, and find-in-page opens it", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "collapsible" });
    const panels = frame.locator(part("collapsible-panel"));
    await expect(panels).toHaveCount(3);
    await expect(panels.nth(2)).toHaveAttribute("hidden", "until-found");
    // a text fragment is Chromium's find-in-page: it fires beforematch on the hidden panel
    await frame.locator("body").evaluate(() => {
        location.hash = ":~:text=2025%20campaign";
    });
    await expect(
        frame.getByRole("button", { name: "Archived", exact: true }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(
        frame.getByRole("link", { name: "2025 campaign" }),
    ).toBeVisible();
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("collapsible");
    await page.goto(`${EMBED_BASE}?id=collapsible`);
    await expect(page.getByRole("navigation")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
