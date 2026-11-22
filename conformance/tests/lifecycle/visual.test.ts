import { expect, test } from "@playwright/test";
import { LIFECYCLE_OVERLAYS } from "../../src/lifecycle.ts";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

// One golden set for every framework, made by React in CI (AGENTS.md rule 5)
test.beforeEach(visualOnlyInCi);

for (const [name, overlay] of Object.entries(LIFECYCLE_OVERLAYS)) {
    test(`lifecycle / ${name}: kept mounted closed, then open`, async ({
        page,
    }) => {
        await openScenario(page, overlay.path, { today: overlay.today });
        await expectScreen(page, `lifecycle-${name}-closed`);
        if (name === "tooltip") {
            // the screenshot parks the pointer away: a focused trigger keeps it open
            await page.keyboard.press("Tab");
        } else {
            await overlay.open(page);
        }
        await expect(page.getByRole(overlay.role)).toBeVisible();
        await expectScreen(page, `lifecycle-${name}-open`);
    });
}
