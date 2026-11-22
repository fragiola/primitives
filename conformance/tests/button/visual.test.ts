import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("button / basic", async ({ page }) => {
    await openScenario(page, "/button/basic");
    await expect(page.getByRole("button")).toHaveCount(5);
    await expectScreen(page, "button-basic");
});

test("button / basic: focused", async ({ page }) => {
    await openScenario(page, "/button/basic");
    await page.keyboard.press("Tab");
    await expect(
        page.getByRole("button", { name: "Save", exact: true }),
    ).toBeFocused();
    await expectScreen(page, "button-basic-focused");
});
