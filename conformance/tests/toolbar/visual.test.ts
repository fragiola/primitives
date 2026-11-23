import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("toolbar / basic: a pressed toggle, the focus on a button", async ({
    page,
}) => {
    await openScenario(page, "/toolbar/basic");
    const bold = page.getByRole("button", { name: "Bold", exact: true });
    await bold.focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(
        page.getByRole("button", { name: "Undo", exact: true }),
    ).toBeFocused();
    await expectScreen(page, "toolbar-basic-focused");
});

test("toolbar / vertical: a column", async ({ page }) => {
    await openScenario(page, "/toolbar/vertical");
    await expect(page.getByRole("toolbar", { name: "Tools" })).toBeVisible();
    await expectScreen(page, "toolbar-vertical");
});
