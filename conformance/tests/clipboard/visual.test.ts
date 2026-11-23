import { test } from "@playwright/test";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);
test.use({ permissions: ["clipboard-read", "clipboard-write"] });

test("clipboard / basic: at rest and copied", async ({ page }) => {
    // the copied state lasts its timeout: the clock is paused once it shows
    await page.clock.install();
    await openScenario(page, "/clipboard/basic");
    await expectScreen(page, "clipboard-basic");
    await page.getByRole("button", { name: "Copy install command" }).click();
    await expectOutput(page, "status", "copied");
    await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 10);
    await expectScreen(page, "clipboard-basic-copied");
});
