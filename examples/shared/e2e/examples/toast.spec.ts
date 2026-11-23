import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    promoted,
    requireExamples,
} from "../helpers.ts";

// toast: the notification stack (spec/toast.md). Toasts are no modal layer: never promoted.

test("a toast shows in the region, announced politely; Dismiss closes it", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "toast" });
    await frame.getByRole("button", { name: "Send message" }).click();
    const region = frame.getByRole("region", { name: "Notifications" });
    const toast = region.getByRole("dialog", { name: "Message 1 sent" });
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-primitives-part", "toast-root");
    await expect(region.locator('[aria-live="polite"]')).toContainText(
        "Message 1 sent",
    );
    await toast.getByRole("button", { name: "Dismiss" }).click();
    await expect(toast).toHaveCount(0);
    expect(await promoted(page)).toBe(false);
    expect(errors).toEqual([]);
});

test("an urgent toast is an alertdialog; F6 reaches the region and Escape closes it", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "toast" });
    const offline = frame.getByRole("button", { name: "Go offline" });
    await offline.click();
    const region = frame.getByRole("region", { name: "Notifications" });
    const alert = region.getByRole("alertdialog", { name: "You are offline" });
    await expect(alert).toBeVisible();
    await offline.focus();
    await page.keyboard.press("F6");
    await expect(region).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(alert).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(alert).toHaveCount(0);
    await expect(offline).toBeFocused();
});

test("axe finds no violation with toasts shown", async ({ page }) => {
    requireExamples("toast");
    await page.goto(`${EMBED_BASE}?id=toast`);
    await page.getByRole("button", { name: "Send message" }).click();
    await page.getByRole("button", { name: "Go offline" }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
