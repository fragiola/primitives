import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("toggle / basic: pressed and focused", async ({ page }) => {
    await openScenario(page, "/toggle/basic");
    const bold = page.getByRole("button", { name: "Bold", exact: true });
    await bold.focus();
    await page.keyboard.press("Enter");
    await expect(bold).toHaveAttribute("aria-pressed", "true");
    await expectScreen(page, "toggle-basic-pressed");
});
