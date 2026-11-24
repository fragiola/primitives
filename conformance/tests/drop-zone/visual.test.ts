import { expect, test } from "@playwright/test";
import { part } from "../../src/contract.ts";
import { dispatchFileDrag } from "../../src/files.ts";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("drop-zone / basic: at rest, focused and a drop target", async ({
    page,
}) => {
    await openScenario(page, "/drop-zone/basic");
    await expectScreen(page, "drop-zone-basic");
    const root = part(page, "drop-zone", "root");
    await page.keyboard.press("Tab");
    await expect(root).toBeFocused();
    await expectScreen(page, "drop-zone-basic-focused");
    await dispatchFileDrag(
        root,
        ["dragenter", "dragover"],
        [{ name: "a.png" }],
    );
    await expect(root).toHaveAttribute("data-drop-target", "");
    await expectScreen(page, "drop-zone-basic-drop-target");
});

test("drop-zone / disabled", async ({ page }) => {
    await openScenario(page, "/drop-zone/disabled");
    await expectScreen(page, "drop-zone-disabled");
});
