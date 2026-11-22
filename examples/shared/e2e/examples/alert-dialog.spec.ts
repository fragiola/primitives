import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    promoted,
    requireExamples,
    settleAnimations,
} from "../helpers.ts";

// alert-dialog: the "Discard draft" confirmation (spec/alert-dialog.md). A modal overlay: inside
// the site's frame it is promoted over the whole page, as a dialog.

test("asks before discarding: focus on Keep editing, a press outside does nothing", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "alert-dialog" });
    const trigger = frame.getByRole("button", { name: "Discard draft" });
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await expect(trigger).toHaveAttribute(
        "data-primitives-part",
        "alert-dialog-trigger",
    );

    await trigger.click();
    const alert = frame.getByRole("alertdialog", { name: "Discard draft?" });
    await expect(alert).toBeVisible();
    await expect(alert).toHaveAttribute("aria-modal", "true");
    await expect(alert).toHaveAttribute(
        "data-primitives-part",
        "alert-dialog-popup",
    );
    await expect(
        frame.getByRole("button", { name: "Keep editing" }),
    ).toBeFocused();
    await expect.poll(() => promoted(page)).toBe(true);

    // a press on the backdrop: nothing happens
    await settleAnimations(page);
    await page.mouse.click(8, 8);
    await page.waitForTimeout(200);
    await expect(alert).toBeVisible();
    await expect(
        frame.getByRole("button", { name: "Keep editing" }),
    ).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(alert).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(frame.getByLabel("Draft")).toHaveValue(
        "Dear Ada, the engine is ready.",
    );
    await expect.poll(() => promoted(page)).toBe(false);
    expect(errors).toEqual([]);
});

test("Discard clears the draft and closes it", async ({ page }) => {
    const frame = await openHosted(page, { id: "alert-dialog" });
    const trigger = frame.getByRole("button", { name: "Discard draft" });
    await trigger.click();
    await expect(frame.getByRole("alertdialog")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(
        frame.getByRole("button", { name: "Discard", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(frame.getByRole("alertdialog")).toHaveCount(0);
    await expect(frame.getByLabel("Draft")).toHaveValue("");
    // nothing left to discard
    await expect(trigger).toBeDisabled();
});

test("axe finds no violation with the alert dialog open", async ({ page }) => {
    requireExamples("alert-dialog");
    await page.goto(`${EMBED_BASE}?id=alert-dialog`);
    await page.getByRole("button", { name: "Discard draft" }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
