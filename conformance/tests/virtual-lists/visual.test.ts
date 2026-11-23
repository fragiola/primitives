import { expect, type Page, test } from "@playwright/test";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

const option = (page: Page, name: string) =>
    page.getByRole("option", { name, exact: true });

test("listbox-virtual / basic: the far end, a range selected", async ({
    page,
}) => {
    await openScenario(page, "/listbox-virtual/basic");
    await page.keyboard.press("Tab");
    await page.keyboard.press("z");
    await page.keyboard.press("Space");
    await page.keyboard.press("Shift+ArrowDown");
    await page.keyboard.press("Shift+ArrowDown");
    await expectOutput(page, "count", "3");
    await expect(option(page, "Item 7779")).toBeFocused();
    await expectScreen(page, "listbox-virtual-basic");
});

test("listbox-virtual / async: two pages loaded", async ({ page }) => {
    await openScenario(page, "/listbox-virtual/async");
    await expectOutput(page, "count", "50");
    await page.getByRole("listbox").evaluate((element) => {
        element.scrollTop = element.scrollHeight;
    });
    await expectOutput(page, "count", "100");
    await expectOutput(page, "status", "idle");
    await expectScreen(page, "listbox-virtual-async");
});

test("select-virtual / basic: open on a far item", async ({ page }) => {
    await openScenario(page, "/select-virtual/basic");
    await page.getByRole("combobox", { name: "Item" }).click();
    await page.keyboard.press("z");
    await page.keyboard.press("Enter");
    await expectOutput(page, "value", "item-7777");
    await page.getByRole("combobox", { name: "Item" }).click();
    await expect(option(page, "Zulu")).toHaveAttribute("data-highlighted", "");
    await expectScreen(page, "select-virtual-basic");
});

test("select-virtual / async: open", async ({ page }) => {
    await openScenario(page, "/select-virtual/async");
    await expectOutput(page, "count", "50");
    await page.getByRole("combobox", { name: "Item" }).click();
    await expect(option(page, "Item 1")).toBeVisible();
    await expectScreen(page, "select-virtual-async");
});

test("combobox-virtual / basic: the end of the list", async ({ page }) => {
    await openScenario(page, "/combobox-virtual/basic");
    await page.getByRole("combobox", { name: "Item" }).click();
    await page.keyboard.press("ArrowUp");
    await expect(option(page, "Item 10000")).toHaveAttribute(
        "data-highlighted",
        "",
    );
    await expectScreen(page, "combobox-virtual-basic");
});

test("combobox-virtual / async: a filtered page", async ({ page }) => {
    await openScenario(page, "/combobox-virtual/async");
    await page.getByRole("combobox", { name: "Item" }).pressSequentially("12");
    await expectOutput(page, "filter", "12");
    await expect(option(page, "Item 12")).toBeVisible();
    await expectScreen(page, "combobox-virtual-async");
});

test("autocomplete-virtual / basic: the matches", async ({ page }) => {
    await openScenario(page, "/autocomplete-virtual/basic");
    await page
        .getByRole("combobox", { name: "Search" })
        .pressSequentially("Item 1");
    await page.keyboard.press("ArrowUp");
    await expect(option(page, "Item 10000")).toHaveAttribute(
        "data-highlighted",
        "",
    );
    await expectScreen(page, "autocomplete-virtual-basic");
});

test("autocomplete-virtual / async: a filtered page", async ({ page }) => {
    await openScenario(page, "/autocomplete-virtual/async");
    await page
        .getByRole("combobox", { name: "Search" })
        .pressSequentially("12");
    await expectOutput(page, "filter", "12");
    await expect(option(page, "Item 12")).toBeVisible();
    await expectScreen(page, "autocomplete-virtual-async");
});
