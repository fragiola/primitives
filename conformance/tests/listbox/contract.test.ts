import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/listbox.md: anatomy, state attributes, the roving tab stop, the hidden inputs
test("listbox / single: parts, states and the tab stop", async ({ page }) => {
    await openScenario(page, "/listbox/single");
    const root = part(page, "listbox", "root");
    await expect(root).toHaveAttribute("role", "listbox");
    await expect(root).toHaveAttribute("aria-orientation", "vertical");
    await expect(root).toHaveAttribute("data-orientation", "vertical");
    await expect(root).not.toHaveAttribute("data-multiple");
    await expect(root).not.toHaveAttribute("data-disabled");

    const items = part(page, "listbox", "item");
    await expect(items).toHaveCount(7);
    // nothing selected: the first option holds the tab stop
    await expect(items.nth(0)).toHaveAttribute("tabindex", "0");
    for (const index of [1, 2, 3, 4, 5, 6]) {
        await expect(items.nth(index)).toHaveAttribute("tabindex", "-1");
    }
    for (const item of await items.all()) {
        await expect(item).toHaveAttribute("role", "option");
        await expect(item).toHaveAttribute("id", /.+/);
        await expect(item).toHaveAttribute("aria-selected", "false");
        await expect(item).not.toHaveAttribute("data-selected");
        await expect(item).not.toHaveAttribute("data-highlighted");
    }
    await expect(items.nth(6)).toHaveAttribute("data-disabled", "");
    await expect(part(page, "listbox", "item-indicator")).toHaveCount(0);

    // a single list without a name: the validation input only
    const inputs = part(page, "listbox", "input");
    await expect(inputs).toHaveCount(1);
    await expect(inputs).toHaveAttribute("aria-hidden", "true");
    await expect(inputs).toHaveAttribute("tabindex", "-1");
    await expect(inputs).toHaveValue("");

    const banana = items.nth(1);
    await banana.click();
    await expect(banana).toHaveAttribute("aria-selected", "true");
    await expect(banana).toHaveAttribute("data-selected", "");
    await expect(banana).toHaveAttribute("data-highlighted", "");
    await expect(banana).toHaveAttribute("tabindex", "0");
    await expect(items.nth(0)).toHaveAttribute("tabindex", "-1");
    const indicator = part(banana, "listbox", "item-indicator");
    await expect(indicator).toHaveCount(1);
    await expect(indicator).toHaveAttribute("aria-hidden", "true");
    await expect(inputs).toHaveValue("banana");
    await expectNoFalseStates(parts(page, "listbox"));

    // the focus leaves: no highlight; the tab stop is the selected option
    await page.getByRole("button", { name: "After" }).focus();
    await expect(banana).not.toHaveAttribute("data-highlighted");
    await expect(banana).toHaveAttribute("tabindex", "0");
});

test("listbox / multiple: multiselectable", async ({ page }) => {
    await openScenario(page, "/listbox/multiple");
    const root = part(page, "listbox", "root");
    await expect(root).toHaveAttribute("aria-multiselectable", "true");
    await expect(root).toHaveAttribute("data-multiple", "");
    await expect(part(page, "listbox", "input")).toHaveCount(1);
});

test("listbox / groups: groups, labels and the separator", async ({ page }) => {
    await openScenario(page, "/listbox/groups");
    const groups = part(page, "listbox", "group");
    await expect(groups).toHaveCount(2);
    const labels = part(page, "listbox", "group-label");
    for (const [index, group] of (await groups.all()).entries()) {
        await expect(group).toHaveAttribute("role", "group");
        const id = await labels.nth(index).getAttribute("id");
        expect(id).toBeTruthy();
        await expect(group).toHaveAttribute("aria-labelledby", id as string);
    }
    const separator = part(page, "listbox", "separator");
    await expect(separator).toHaveCount(1);
    await expect(separator).toHaveAttribute("role", "presentation");
    await expect(separator).toHaveAttribute("data-orientation", "horizontal");
});

test("listbox / horizontal: orientation and the selected tab stop", async ({
    page,
}) => {
    await openScenario(page, "/listbox/horizontal");
    const root = part(page, "listbox", "root");
    await expect(root).toHaveAttribute("aria-orientation", "horizontal");
    await expect(root).toHaveAttribute("data-orientation", "horizontal");
    const items = part(page, "listbox", "item");
    await expect(items.nth(1)).toHaveAttribute("tabindex", "0");
    await expect(items.nth(1)).toHaveAttribute("data-selected", "");
});

test("listbox / field: the hidden inputs and the field's states", async ({
    page,
}) => {
    await openScenario(page, "/listbox/field");
    const roots = part(page, "listbox", "root");
    const fruit = roots.nth(0);
    await expect(fruit).toHaveAttribute("aria-required", "true");
    await expect(fruit).toHaveAttribute("aria-labelledby", /.+/);
    const fruitInput = part(fruit, "listbox", "input");
    await expect(fruitInput).toHaveCount(1);
    await expect(fruitInput).toHaveAttribute("name", "fruit");
    await expect(fruitInput).toHaveAttribute("required", "");
    await expect(fruitInput).not.toHaveAttribute("type", "hidden");

    // multiple: the validation input (no name), then one hidden input per value
    const toppings = part(roots.nth(1), "listbox", "input");
    await expect(toppings).toHaveCount(2);
    await expect(toppings.nth(0)).not.toHaveAttribute("name");
    await expect(toppings.nth(1)).toHaveAttribute("type", "hidden");
    await expect(toppings.nth(1)).toHaveAttribute("name", "toppings");
    await expect(toppings.nth(1)).toHaveValue("cheese");

    await page.getByRole("button", { name: "Submit" }).click();
    await expect(fruit).toHaveAttribute("data-invalid", "");
    await expect(fruit).toHaveAttribute("aria-invalid", "true");
    await expectNoFalseStates(parts(page, "listbox"));
});
