import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("cascade-select / basic: closed", async ({ page }) => {
    await openScenario(page, "/cascade-select/basic");
    await expect(page.getByRole("combobox", { name: "Location" })).toHaveText(
        "Choose a place",
    );
    await expectScreen(page, "cascade-select-basic-closed");
});

test("cascade-select / basic: open on three levels", async ({ page }) => {
    await openScenario(page, "/cascade-select/basic");
    const trigger = page.getByRole("combobox", { name: "Location" });
    await trigger.click();
    await page.getByRole("option", { name: "Europe" }).click();
    await page.getByRole("option", { name: "France" }).click();
    await page.getByRole("option", { name: "Paris" }).click();
    await expect(trigger).toHaveText("Europe / France / Paris");
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("listbox")).toHaveCount(3);
    await expectScreen(page, "cascade-select-basic-open");
});
