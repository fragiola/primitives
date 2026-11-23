import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("time-zones / field", async ({ page }) => {
    await openScenario(page, "/time-zones/field", { today: true });
    await expect(
        page.locator('[data-type="timeZoneName"]').first(),
    ).toBeVisible();
    await expectScreen(page, "time-zones-field");
});

test("time-zones / picker: open", async ({ page }) => {
    await openScenario(page, "/time-zones/picker", { today: true });
    await page.getByRole("button", { name: "Meeting Choose date" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectScreen(page, "time-zones-picker");
});
