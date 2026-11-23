import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("listbox / single: selected and focused", async ({ page }) => {
    await openScenario(page, "/listbox/single");
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");
    await expect(
        page.getByRole("option", { name: "Banana", exact: true }),
    ).toHaveAttribute("aria-selected", "true");
    await expectScreen(page, "listbox-single-selected");
});

test("listbox / multiple: a range selected", async ({ page }) => {
    await openScenario(page, "/listbox/multiple");
    const onions = page.getByRole("option", { name: "Onions", exact: true });
    await onions.click();
    await page
        .getByRole("option", { name: "Spinach", exact: true })
        .click({ modifiers: ["Shift"] });
    await expect(page.getByRole("option", { selected: true })).toHaveCount(4);
    await expectScreen(page, "listbox-multiple-range");
});

test("listbox / groups", async ({ page }) => {
    await openScenario(page, "/listbox/groups");
    await expect(page.getByRole("group")).toHaveCount(2);
    await expectScreen(page, "listbox-groups");
});

test("listbox / horizontal", async ({ page }) => {
    await openScenario(page, "/listbox/horizontal");
    await expect(
        page.getByRole("option", { name: "M", exact: true }),
    ).toHaveAttribute("aria-selected", "true");
    await expectScreen(page, "listbox-horizontal");
});

test("listbox / field: invalid", async ({ page }) => {
    await openScenario(page, "/listbox/field");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Choose a fruit.")).toBeVisible();
    await expectScreen(page, "listbox-field-invalid");
});
