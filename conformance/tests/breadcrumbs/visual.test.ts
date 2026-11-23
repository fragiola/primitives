import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("breadcrumbs / basic", async ({ page }) => {
    await openScenario(page, "/breadcrumbs/basic");
    await expect(
        page.getByRole("link", { name: "Breadcrumbs", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expectScreen(page, "breadcrumbs-basic");
});

test("breadcrumbs / collapsed, the menu open", async ({ page }) => {
    await openScenario(page, "/breadcrumbs/collapsed");
    await page.getByRole("button", { name: "Show the hidden pages" }).click();
    await expect(page.getByRole("menu")).toBeVisible();
    await expectScreen(page, "breadcrumbs-collapsed-open");
});
