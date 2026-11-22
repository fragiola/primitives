import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    promoted,
    requireExamples,
} from "../helpers.ts";

// popover: the "Notifications" popover (spec/popover.md). It is non-modal: never promoted.

test("opens on its first button, Tab leaves it closed, Escape returns to the trigger", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "popover" });
    const trigger = frame.getByRole("button", { name: "Notifications" });
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await expect(trigger).toHaveAttribute(
        "data-primitives-part",
        "popover-trigger",
    );

    await trigger.click();
    const popover = frame.getByRole("dialog", { name: "Notifications" });
    await expect(popover).toBeVisible();
    await expect(popover).not.toHaveAttribute("aria-modal");
    await expect(popover).toHaveAttribute("data-side", "bottom");
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    await expect(frame.getByRole("button", { name: "Dismiss" })).toBeFocused();
    expect(await promoted(page)).toBe(false);

    await page.keyboard.press("Escape");
    await expect(popover).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(frame.getByRole("button", { name: "Dismiss" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
        frame.getByRole("button", { name: "Mark all as read" }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(popover).toHaveCount(0);
    expect(errors).toEqual([]);
});

test("a press outside closes it, focus back on the trigger", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "popover" });
    const trigger = frame.getByRole("button", { name: "Notifications" });
    await trigger.click();
    await expect(frame.getByRole("dialog")).toBeVisible();
    const box = await page.getByTestId("frame").boundingBox();
    await page.mouse.click((box?.x ?? 0) + 8, (box?.y ?? 0) + 8);
    await expect(frame.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();
});

test("axe finds no violation with the popover open", async ({ page }) => {
    requireExamples("popover");
    await page.goto(`${EMBED_BASE}?id=popover`);
    await page.getByRole("button", { name: "Notifications" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
