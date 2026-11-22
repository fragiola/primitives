import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// progress: upload progress (spec/progress.md). A Progress "Upload" at 25 of 100, buttons
// "Add 25%", "Unknown" (indeterminate) and "Reset" (0); a Progress "Storage" at 128 of 512
// written in gigabytes.

test("the buttons move the upload, or make it indeterminate", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "progress" });
    const upload = frame.getByRole("progressbar", { name: "Upload" });
    await expect(upload).toHaveAttribute(
        "data-primitives-part",
        "progress-root",
    );
    await expect(upload).toHaveAttribute("aria-valuenow", "25");
    await expect(upload).toHaveAttribute("aria-valuetext", "25%");
    await frame.getByRole("button", { name: "Add 25%" }).click();
    await expect(upload).toHaveAttribute("aria-valuenow", "50");
    await frame.getByRole("button", { name: "Add 25%" }).click();
    await frame.getByRole("button", { name: "Add 25%" }).click();
    await expect(upload).toHaveAttribute("aria-valuenow", "100");
    await expect(upload).toHaveAttribute("data-complete", "");
    await frame.getByRole("button", { name: "Unknown" }).click();
    await expect(upload).not.toHaveAttribute("aria-valuenow");
    await expect(upload).toHaveAttribute("data-indeterminate", "");
    await frame.getByRole("button", { name: "Reset" }).click();
    await expect(upload).toHaveAttribute("aria-valuenow", "0");

    const storage = frame.getByRole("progressbar", { name: "Storage" });
    await expect(storage).toHaveAttribute("aria-valuetext", "128 GB");
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("progress");
    await page.goto(`${EMBED_BASE}?id=progress`);
    await expect(page.getByRole("progressbar")).toHaveCount(2);
    expect(await axeViolations(page)).toEqual([]);
});
