import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    promoted,
    requireExamples,
} from "../helpers.ts";

// select: a fruit picker (spec/select.md). Non-modal: never promoted.

test("focus stays on the trigger; typing opens on the match; Enter and Tab choose", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "select" });
    const trigger = frame.getByRole("combobox", { name: "Fruit" });
    await expect(trigger).toHaveAttribute(
        "data-primitives-part",
        "select-trigger",
    );
    await expect(trigger).toHaveText("Choose a fruit");

    // a printable key on the closed trigger opens the list on the match, without choosing
    await trigger.focus();
    await page.keyboard.press("c");
    const listbox = frame.getByRole("listbox");
    await expect(listbox).toBeVisible();
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    await expect(trigger).toBeFocused();
    const cherry = frame.getByRole("option", { name: "Cherry" });
    await expect(trigger).toHaveAttribute(
        "aria-activedescendant",
        (await cherry.getAttribute("id")) as string,
    );
    await expect(trigger).toHaveText("Choose a fruit");
    expect(await promoted(page)).toBe(false);
    await page.keyboard.press("Enter");
    await expect(listbox).toHaveCount(0);
    await expect(trigger).toHaveText("Cherry");

    // Tab chooses the highlighted option and moves on
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(cherry).toHaveAttribute("data-highlighted", "");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Tab");
    await expect(listbox).toHaveCount(0);
    await expect(trigger).toHaveText("Grape");
    expect(errors).toEqual([]);
});

test("a disabled fruit cannot be chosen", async ({ page }) => {
    const frame = await openHosted(page, { id: "select" });
    await frame.getByRole("combobox", { name: "Fruit" }).click();
    const orange = frame.getByRole("option", { name: "Orange" });
    await expect(orange).toHaveAttribute("aria-disabled", "true");
    await orange.click({ force: true });
    await expect(frame.getByRole("listbox")).toBeVisible();
    await frame.getByRole("option", { name: "Mango" }).click();
    await expect(frame.getByRole("combobox", { name: "Fruit" })).toHaveText(
        "Mango",
    );
});

test("axe finds no violation with the list open", async ({ page }) => {
    requireExamples("select");
    await page.goto(`${EMBED_BASE}?id=select`);
    await page.getByRole("combobox", { name: "Fruit" }).click();
    await expect(page.getByRole("listbox")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
