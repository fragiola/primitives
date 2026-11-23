import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("editable / basic: at rest and editing", async ({ page }) => {
    await openScenario(page, "/editable/basic");
    await expectScreen(page, "editable-basic");
    await page.getByRole("button", { name: "Edit title" }).click();
    await expect(
        page.getByRole("textbox", { name: "Title", exact: true }),
    ).toBeFocused();
    await expectScreen(page, "editable-basic-editing");
});

test("editable / states: placeholder, disabled and read-only", async ({
    page,
}) => {
    await openScenario(page, "/editable/states");
    await expectScreen(page, "editable-states");
});
