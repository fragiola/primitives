import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("separator / basic", async ({ page }) => {
    await openScenario(page, "/separator/basic");
    await expect(page.getByRole("separator")).toHaveCount(2);
    await expectScreen(page, "separator-basic");
});
