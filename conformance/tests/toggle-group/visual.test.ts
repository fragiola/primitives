import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("toggle-group / basic: one pressed, another focused", async ({ page }) => {
    await openScenario(page, "/toggle-group/basic");
    await page.getByRole("button", { name: "Left", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(
        page.getByRole("button", { name: "Center", exact: true }),
    ).toBeFocused();
    await expectScreen(page, "toggle-group-basic-focused");
});

test("toggle-group / vertical: a column, two pressed", async ({ page }) => {
    await openScenario(page, "/toggle-group/vertical");
    await page.getByRole("button", { name: "Italic", exact: true }).click();
    await expect(
        page.getByRole("button", { name: "Italic", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expectScreen(page, "toggle-group-vertical");
});
