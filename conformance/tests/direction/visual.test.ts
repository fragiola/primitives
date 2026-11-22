import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("direction / provider", async ({ page }) => {
    await openScenario(page, "/direction/provider", { today: true });
    await expect(page.getByRole("tab", { name: "Account" })).toBeVisible();
    await expectScreen(page, "direction-provider");
});
