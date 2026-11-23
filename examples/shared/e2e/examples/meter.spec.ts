import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// meter: a storage meter (spec/meter.md). A Meter "Storage" at 384 of 512 written in gigabytes,
// and a Meter "Battery" at 60 written as a percentage.

test("the meters show their values, formatted", async ({ page }) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "meter" });
    const storage = frame.getByRole("meter", { name: "Storage" });
    await expect(storage).toHaveAttribute("data-primitives-part", "meter-root");
    await expect(storage).toHaveAttribute("aria-valuenow", "384");
    await expect(storage).toHaveAttribute("aria-valuemax", "512");
    await expect(storage).toHaveAttribute("aria-valuetext", "384 GB");
    const battery = frame.getByRole("meter", { name: "Battery" });
    await expect(battery).toHaveAttribute("aria-valuetext", "60%");
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("meter");
    await page.goto(`${EMBED_BASE}?id=meter`);
    await expect(page.getByRole("meter")).toHaveCount(2);
    expect(await axeViolations(page)).toEqual([]);
});
