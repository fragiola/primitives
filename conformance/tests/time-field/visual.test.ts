import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { typeKeys } from "../../src/segments.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("time-field / basic", async ({ page }) => {
    await openScenario(page, "/time-field/basic", { today: true });
    await page.getByRole("spinbutton").first().focus();
    await typeKeys(page, "930");
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expect(page.getByRole("spinbutton").nth(1)).toHaveAttribute(
        "aria-valuenow",
        "30",
    );
    await expectScreen(page, "time-field-basic");
});

test("time-field / basic?locale=de-DE", async ({ page }) => {
    await openScenario(page, "/time-field/basic", {
        today: true,
        locale: "de-DE",
    });
    await page.getByRole("spinbutton").first().focus();
    await typeKeys(page, "1430");
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expect(page.getByTestId("output")).toContainText("14:30");
    await expectScreen(page, "time-field-basic-de");
});
