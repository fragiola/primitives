import { expect, test } from "@playwright/test";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("avatar / basic", async ({ page }) => {
    await openScenario(page, "/avatar/basic");
    await expectOutput(page, "ada", "loaded");
    await expectOutput(page, "missing", "error");
    await expect(page.getByText("KJ", { exact: true })).toBeVisible();
    await expectScreen(page, "avatar-basic");
});
