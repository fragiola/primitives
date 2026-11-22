import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// menu-view-options: a "View" menu of checkbox and radio items (spec/menu.md).

test("Space toggles and checks and keeps the menu open; Enter closes it", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "menu-view-options" });
    const trigger = frame.getByRole("button", { name: "View" });
    const checkbox = (name: string) =>
        frame.getByRole("menuitemcheckbox", { name });
    const radio = (name: string) => frame.getByRole("menuitemradio", { name });
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    const menu = frame.getByRole("menu", { name: "View" });
    await expect(menu).toBeVisible();
    await expect(checkbox("Show toolbar")).toBeFocused();
    await expect(checkbox("Show toolbar")).toHaveAttribute(
        "aria-checked",
        "true",
    );
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press(" ");
    await expect(checkbox("Show status bar")).toHaveAttribute(
        "aria-checked",
        "true",
    );
    await expect(menu).toBeVisible();
    await page.keyboard.press("End");
    await expect(radio("Size")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(frame.getByText("Size", { exact: true })).toBeVisible();
    await expect(
        frame.getByRole("definition").filter({ hasText: "shown" }),
    ).toHaveCount(2);
    expect(errors).toEqual([]);
});

test("a click toggles and keeps the menu open", async ({ page }) => {
    const frame = await openHosted(page, { id: "menu-view-options" });
    await frame.getByRole("button", { name: "View" }).click();
    await frame.getByRole("menuitemcheckbox", { name: "Show toolbar" }).click();
    await expect(frame.getByRole("menu", { name: "View" })).toBeVisible();
    await expect(
        frame.getByRole("menuitemcheckbox", { name: "Show toolbar" }),
    ).toHaveAttribute("aria-checked", "false");
    await frame.getByRole("menuitemradio", { name: "Date modified" }).click();
    await expect(
        frame.getByRole("menuitemradio", { name: "Date modified" }),
    ).toHaveAttribute("aria-checked", "true");
    await expect(frame.getByRole("menu", { name: "View" })).toBeVisible();
});

test("axe finds no violation with the menu open", async ({ page }) => {
    requireExamples("menu-view-options");
    await page.goto(`${EMBED_BASE}?id=menu-view-options`);
    await page.getByRole("button", { name: "View" }).click();
    await expect(page.getByRole("menu")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
