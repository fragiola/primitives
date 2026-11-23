import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("link / basic", async ({ page }) => {
    await openScenario(page, "/link/basic");
    await expect(
        page.getByRole("link", { name: "Home", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expectScreen(page, "link-basic");
});

test("link / basic, the disabled link focused", async ({ page }) => {
    await openScenario(page, "/link/basic");
    await page.getByRole("link", { name: "Docs", exact: true }).focus();
    await page.keyboard.press("Tab");
    await expect(
        page.getByRole("link", { name: "Archive", exact: true }),
    ).toBeFocused();
    await expectScreen(page, "link-basic-disabled-focused");
});
