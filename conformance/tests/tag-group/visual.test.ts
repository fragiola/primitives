import { expect, type Page, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

const tag = (page: Page, name: string) =>
    page.getByRole("row", { name: new RegExp(`^${name}\\b`) });

test("tag-group / basic: focused", async ({ page }) => {
    await openScenario(page, "/tag-group/basic");
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowRight");
    await expect(tag(page, "Travel")).toBeFocused();
    await expectScreen(page, "tag-group-basic-focused");
});

test("tag-group / selection: selected", async ({ page }) => {
    await openScenario(page, "/tag-group/selection");
    await tag(page, "News").click();
    await expect(page.getByRole("row", { selected: true })).toHaveCount(2);
    await expectScreen(page, "tag-group-selection");
});

test("tag-group / disabled", async ({ page }) => {
    await openScenario(page, "/tag-group/disabled");
    await expect(tag(page, "Travel")).toHaveAttribute("aria-disabled", "true");
    await expectScreen(page, "tag-group-disabled");
});
