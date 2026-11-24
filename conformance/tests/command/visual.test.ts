import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("command / basic: the groups with a highlight", async ({ page }) => {
    await openScenario(page, "/command/basic");
    await page.getByRole("combobox", { name: "Command" }).focus();
    await page.keyboard.press("ArrowDown");
    await expect(
        page.getByRole("option", { name: "Search Emoji" }),
    ).toHaveAttribute("data-highlighted", "");
    await expectScreen(page, "command-basic");
});

test("command / basic: filtered, one group hidden", async ({ page }) => {
    await openScenario(page, "/command/basic");
    await page.getByRole("combobox", { name: "Command" }).fill("ar");
    await expect(page.getByRole("option")).toHaveCount(3);
    await expectScreen(page, "command-basic-filtered");
});

test("command / basic: no result", async ({ page }) => {
    await openScenario(page, "/command/basic");
    await page.getByRole("combobox", { name: "Command" }).fill("zzz");
    await expect(page.getByText("No results.")).toBeVisible();
    await expectScreen(page, "command-basic-empty");
});

test("command / dialog: open", async ({ page }) => {
    await openScenario(page, "/command/dialog");
    await page.getByRole("button", { name: "Open command menu" }).click();
    await expect(page.getByRole("combobox", { name: "Command" })).toBeFocused();
    await expectScreen(page, "command-dialog-open");
});

test("command-virtual / basic: the first rows", async ({ page }) => {
    await openScenario(page, "/command-virtual/basic");
    await expect(page.getByRole("option").first()).toHaveAttribute(
        "data-highlighted",
        "",
    );
    await expectScreen(page, "command-virtual-basic");
});
