import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// toast-promise: the upload progress (spec/toast.md, promise toasts).

test("an upload shows its progress, then its result", async ({ page }) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "toast-promise" });
    await frame.getByRole("button", { name: "Upload report.pdf" }).click();
    const region = frame.getByRole("region", { name: "Notifications" });
    const toast = region.getByRole("dialog");
    await expect(toast).toHaveAccessibleName("Uploading report.pdf");
    await expect(toast).toHaveAttribute("data-type", "loading");
    await expect(toast).toHaveAccessibleName("report.pdf uploaded", {
        timeout: 5000,
    });
    await expect(toast).toHaveAttribute("data-type", "success");
    expect(errors).toEqual([]);
});

test("a failed upload shows the error", async ({ page }) => {
    const frame = await openHosted(page, { id: "toast-promise" });
    await frame.getByRole("button", { name: "Upload too-large.zip" }).click();
    const toast = frame
        .getByRole("region", { name: "Notifications" })
        .getByRole("dialog", { name: "Could not upload too-large.zip" });
    await expect(toast).toBeVisible({ timeout: 5000 });
    await expect(toast).toHaveAccessibleDescription("the file is over 10 MB");
    await expect(toast).toHaveAttribute("data-type", "error");
});

test("axe finds no violation while an upload runs", async ({ page }) => {
    requireExamples("toast-promise");
    await page.goto(`${EMBED_BASE}?id=toast-promise`);
    await page.getByRole("button", { name: "Upload report.pdf" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
