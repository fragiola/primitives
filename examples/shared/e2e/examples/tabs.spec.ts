import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    messages,
    openHosted,
    part,
    requireExamples,
} from "../helpers.ts";

// tabs: account settings in tabs (spec/tabs.md): automatic activation, a disabled tab that stays
// focusable, an indicator that follows the selection. Tabs open no modal overlay: never promoted.

test("the arrow keys move and select; a disabled tab is focusable, never selected", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "tabs" });
    const list = frame.getByRole("tablist", { name: "Account settings" });
    await expect(list).toHaveAttribute("data-primitives-part", "tabs-list");
    const tab = (name: string) => list.getByRole("tab", { name });

    await expect(tab("Account")).toHaveAttribute("aria-selected", "true");
    await expect(tab("Account")).toHaveAttribute("data-selected", "");
    await expect(
        frame.getByRole("tabpanel", { name: "Account" }),
    ).toBeVisible();

    await tab("Account").focus();
    await page.keyboard.press("ArrowRight");
    await expect(tab("Password")).toBeFocused();
    await expect(tab("Password")).toHaveAttribute("aria-selected", "true");
    await expect(
        frame.getByRole("tabpanel", { name: "Password" }),
    ).toBeVisible();

    await page.keyboard.press("End");
    await expect(tab("Billing")).toBeFocused();
    await expect(tab("Billing")).toHaveAttribute("aria-disabled", "true");
    await expect(tab("Billing")).toHaveAttribute("aria-selected", "false");
    await expect(tab("Password")).toHaveAttribute("aria-selected", "true");

    // loopFocus: from the last tab to the first
    await page.keyboard.press("ArrowRight");
    await expect(tab("Account")).toBeFocused();
    await expect(tab("Account")).toHaveAttribute("aria-selected", "true");

    await tab("Notifications").click();
    await expect(tab("Notifications")).toHaveAttribute("aria-selected", "true");
    // Tab goes from the tab list to the selected panel
    await page.keyboard.press("Tab");
    await expect(
        frame.getByRole("tabpanel", { name: "Notifications" }),
    ).toBeFocused();
    expect(
        (await messages(page)).filter(
            (m) => m.type === "fragiola:example:overlay",
        ),
    ).toEqual([]);
    expect(errors).toEqual([]);
});

test("the indicator follows the selected tab", async ({ page }) => {
    const frame = await openHosted(page, { id: "tabs" });
    const indicator = frame.locator(part("tabs-indicator"));
    const width = async (name: string) =>
        (await frame.getByRole("tab", { name }).boundingBox())?.width;
    await expect
        .poll(async () => (await indicator.boundingBox())?.width)
        .toBeCloseTo((await width("Account")) ?? 0, 0);
    await frame.getByRole("tab", { name: "Notifications" }).click();
    await expect
        .poll(async () => {
            const box = await indicator.boundingBox();
            const tab = await frame
                .getByRole("tab", { name: "Notifications" })
                .boundingBox();
            return Math.round((box?.x ?? 0) - (tab?.x ?? 0));
        })
        .toBe(0);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("tabs");
    await page.goto(`${EMBED_BASE}?id=tabs`);
    await expect(page.getByRole("tablist")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
