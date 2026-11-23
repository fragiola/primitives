import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("pagination / basic", async ({ page }) => {
    await openScenario(page, "/pagination/basic");
    await expect(
        page.getByRole("button", { name: "5", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expectScreen(page, "pagination-basic");
});

test("pagination / basic, on the last page", async ({ page }) => {
    await openScenario(page, "/pagination/basic");
    await page.getByRole("button", { name: "Last page" }).click();
    await expect(
        page.getByRole("button", { name: "Next page" }),
    ).toBeDisabled();
    await expectScreen(page, "pagination-basic-last");
});

test("pagination / links", async ({ page }) => {
    await openScenario(page, "/pagination/links");
    await expect(
        page.getByRole("link", { name: "1", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expectScreen(page, "pagination-links");
});
