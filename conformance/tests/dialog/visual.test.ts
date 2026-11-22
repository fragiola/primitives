import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

// One golden set for every framework, made by React in CI (AGENTS.md rule 5)
test.beforeEach(visualOnlyInCi);

test("dialog / basic: closed and open", async ({ page }) => {
    await openScenario(page, "/dialog/basic");
    await expectScreen(page, "dialog-basic-closed");
    await page.getByRole("button", { name: "Open dialog" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectScreen(page, "dialog-basic-open");
});

test("dialog / nested-tree: every level open", async ({ page }) => {
    await openScenario(page, "/dialog/nested-tree");
    await page.getByRole("button", { name: "Open settings" }).click();
    await page.getByRole("button", { name: "Theme options" }).click();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("menu", { name: "More themes" })).toBeVisible();
    await expectScreen(page, "dialog-nested-tree-open");
});

test("dialog / nested-dialogs: three open", async ({ page }) => {
    await openScenario(page, "/dialog/nested-dialogs");
    for (const opener of ["Open first", "Open second", "Open third"]) {
        await page.getByRole("button", { name: opener }).click();
    }
    await expect(
        page.getByRole("dialog", { name: "Third dialog" }),
    ).toBeVisible();
    await expectScreen(page, "dialog-nested-dialogs-open");
});

test("dialog / detached: open from a row", async ({ page }) => {
    await openScenario(page, "/dialog/detached");
    await page.getByRole("button", { name: "Edit Grace" }).click();
    await expect(
        page.getByRole("dialog", { name: "Edit Grace" }),
    ).toBeVisible();
    await expectScreen(page, "dialog-detached-open");
});
