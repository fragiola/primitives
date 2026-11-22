import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

// One golden set for every framework, made by React in CI (AGENTS.md rule 5)
test.beforeEach(visualOnlyInCi);

test("alert-dialog / basic: open", async ({ page }) => {
    await openScenario(page, "/alert-dialog/basic");
    await page.getByRole("button", { name: "Discard draft" }).click();
    await expect(
        page.getByRole("alertdialog", { name: "Discard draft?" }),
    ).toBeVisible();
    await expectScreen(page, "alert-dialog-basic-open");
});

test("alert-dialog / detached: open from a trigger", async ({ page }) => {
    await openScenario(page, "/alert-dialog/detached");
    await page.getByRole("button", { name: "Delete Grace" }).click();
    await expect(
        page.getByRole("alertdialog", { name: "Delete Grace?" }),
    ).toBeVisible();
    await expectScreen(page, "alert-dialog-detached-open");
});
