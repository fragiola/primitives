import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("progress / basic", async ({ page }) => {
    await openScenario(page, "/progress/basic");
    await expect(
        page.getByRole("progressbar", { name: "Storage" }),
    ).toHaveAttribute("aria-valuetext", "128 GB");
    await expectScreen(page, "progress-basic");
});

test("progress / basic: indeterminate", async ({ page }) => {
    await openScenario(page, "/progress/basic");
    await page.getByRole("button", { name: "Unknown" }).click();
    await expect(
        page.getByRole("progressbar", { name: "Upload" }),
    ).not.toHaveAttribute("aria-valuenow");
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expectScreen(page, "progress-basic-indeterminate");
});
