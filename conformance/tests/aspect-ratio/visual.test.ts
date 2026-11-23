import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("aspect ratio / basic", async ({ page }) => {
    await openScenario(page, "/aspect-ratio/basic");
    await expect(
        page.getByRole("img", { name: "Mountain lake" }),
    ).toBeVisible();
    await expectScreen(page, "aspect-ratio-basic");
});
