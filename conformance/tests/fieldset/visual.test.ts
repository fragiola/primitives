import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("fieldset / basic", async ({ page }) => {
    await openScenario(page, "/fieldset/basic");
    await expect(
        page.getByRole("group", { name: "Shipping address" }),
    ).toBeVisible();
    await expectScreen(page, "fieldset-basic");
});
