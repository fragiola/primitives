import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/progress.md
const bar = (page: Page, name: string) =>
    page.getByRole("progressbar", { name, exact: true });

/** The width of a progress bar's filled part over its rail's: its visible fraction. */
async function filled(page: Page, name: string): Promise<number> {
    return bar(page, name).evaluate((root) => {
        const track = root.querySelector(
            '[data-primitives-part="progress-track"]',
        );
        const indicator = root.querySelector(
            '[data-primitives-part="progress-indicator"]',
        );
        if (track === null || indicator === null) {
            return Number.NaN;
        }
        return (
            indicator.getBoundingClientRect().width /
            track.getBoundingClientRect().width
        );
    });
}

/** The text of a progress bar's Value part. */
const valueText = (page: Page, name: string) =>
    bar(page, name).locator('[data-primitives-part="progress-value"]');

test.describe("progress / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/progress/basic");
    });

    test("a named progress bar at 40, written as a percentage", async ({
        page,
    }) => {
        const upload = bar(page, "Upload");
        await expect(upload).toHaveAttribute("aria-valuenow", "40");
        await expect(upload).toHaveAttribute("aria-valuemin", "0");
        await expect(upload).toHaveAttribute("aria-valuemax", "100");
        await expect(upload).toHaveAttribute("aria-valuetext", "40%");
        await expect(valueText(page, "Upload")).toHaveText("40%");
        await expectOutput(page, "value", "40");
    });

    test("a format writes the value itself; the indicator fills its share of the track", async ({
        page,
    }) => {
        const storage = bar(page, "Storage");
        await expect(storage).toHaveAttribute("aria-valuenow", "128");
        await expect(storage).toHaveAttribute("aria-valuemax", "512");
        await expect(storage).toHaveAttribute("aria-valuetext", "128 GB");
        await expect(valueText(page, "Storage")).toHaveText("128 GB");
        expect(await filled(page, "Storage")).toBeCloseTo(0.25, 2);
    });

    test("complete, the indicator fills the track", async ({ page }) => {
        await page.getByRole("button", { name: "Complete" }).click();
        const upload = bar(page, "Upload");
        await expect(upload).toHaveAttribute("aria-valuenow", "100");
        await expect(upload).toHaveAttribute("aria-valuetext", "100%");
        await expectOutput(page, "value", "100");
        await expect.poll(() => filled(page, "Upload")).toBeCloseTo(1, 2);
    });

    test("indeterminate, it has no value and writes nothing", async ({
        page,
    }) => {
        await page.getByRole("button", { name: "Unknown" }).click();
        await expectOutput(page, "value", "none");
        const upload = bar(page, "Upload");
        await expect(upload).not.toHaveAttribute("aria-valuenow");
        await expect(upload).not.toHaveAttribute("aria-valuetext");
        await expect(valueText(page, "Upload")).toHaveText("");
    });

    test("has no axe violation, in each state", async ({ page }) => {
        await expectNoAxeViolations(page);
        await page.getByRole("button", { name: "Complete" }).click();
        await expect(bar(page, "Upload")).toHaveAttribute(
            "aria-valuenow",
            "100",
        );
        await expectNoAxeViolations(page);
        await page.getByRole("button", { name: "Unknown" }).click();
        await expect(bar(page, "Upload")).not.toHaveAttribute("aria-valuenow");
        await expectNoAxeViolations(page);
    });
});
