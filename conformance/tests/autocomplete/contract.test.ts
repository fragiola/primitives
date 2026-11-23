import { expect, test } from "@playwright/test";
import {
    expectNoFalseStates,
    expectOpenState,
    part,
    parts,
} from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/autocomplete.md: anatomy, state attributes, the Input as the form control
test("autocomplete / basic: parts and states, closed and open", async ({
    page,
}) => {
    await openScenario(page, "/autocomplete/basic");
    const group = part(page, "autocomplete", "input-group");
    const input = part(page, "autocomplete", "input");
    const trigger = part(page, "autocomplete", "trigger");
    await expect(group).toHaveAttribute("role", "group");
    await expect(input).toHaveAttribute("role", "combobox");
    await expect(input).toHaveAttribute("autocomplete", "off");
    await expect(input).toHaveAttribute("aria-autocomplete", "list");
    await expect(input).not.toHaveAttribute("data-popup-open");
    await expect(trigger).toHaveAttribute("type", "button");
    await expect(trigger).toHaveAttribute("tabindex", "-1");
    // no text: no Clear
    await expect(part(page, "autocomplete", "clear")).toHaveCount(0);

    await input.click();
    await page.keyboard.type("b");
    await expect(group).toHaveAttribute("data-popup-open", "");
    await expect(input).toHaveAttribute("data-popup-open", "");
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    const clear = part(page, "autocomplete", "clear");
    await expect(clear).toHaveAttribute("type", "button");
    await expect(clear).toHaveAttribute("tabindex", "-1");

    const list = part(page, "autocomplete", "list");
    const id = await list.getAttribute("id");
    expect(id).toBeTruthy();
    await expect(input).toHaveAttribute("aria-controls", id as string);
    await expect(list).toHaveAttribute("role", "listbox");
    await expect(list).not.toHaveAttribute("aria-multiselectable");
    await expectOpenState(part(page, "autocomplete", "positioner"), true);
    await expectOpenState(part(page, "autocomplete", "popup"), true);
    const empty = part(page, "autocomplete", "empty");
    await expect(empty).toHaveAttribute("role", "status");
    await expect(empty).toHaveAttribute("aria-live", "polite");
    await expect(empty).toBeEmpty();

    const items = part(page, "autocomplete", "item");
    await expect(items).toHaveCount(2);
    for (const item of await items.all()) {
        await expect(item).toHaveAttribute("role", "option");
        await expect(item).toHaveAttribute("id", /.+/);
        await expect(item).not.toHaveAttribute("aria-selected");
        await expect(item).not.toHaveAttribute("data-selected");
    }
    await page.keyboard.press("ArrowDown");
    await expect(items.nth(0)).toHaveAttribute("data-highlighted", "");
    await expectNoFalseStates(parts(page, "autocomplete"));

    await page.keyboard.type("xyz");
    await expect(list).toHaveAttribute("data-empty", "");
    await expect(empty).not.toBeEmpty();
});

test("autocomplete / field: the Input is the form control", async ({
    page,
}) => {
    await openScenario(page, "/autocomplete/field");
    const input = part(page, "autocomplete", "input");
    await expect(input).toHaveAttribute("name", "city");
    await expect(input).toHaveAttribute("required", "");
    await expect(
        page.locator('[data-primitives-part$="hidden-input"]'),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(input).toHaveAttribute("data-invalid", "");
    await expectNoFalseStates(parts(page, "autocomplete"));
});

test("autocomplete / groups: groups, labels and the separator", async ({
    page,
}) => {
    await openScenario(page, "/autocomplete/groups");
    await part(page, "autocomplete", "input").click();
    await page.keyboard.type("c");
    const groups = part(page, "autocomplete", "group");
    await expect(groups).toHaveCount(2);
    const labels = part(page, "autocomplete", "group-label");
    for (const [index, group] of (await groups.all()).entries()) {
        const id = await labels.nth(index).getAttribute("id");
        expect(id).toBeTruthy();
        await expect(group).toHaveAttribute("aria-labelledby", id as string);
    }
    const separator = part(page, "autocomplete", "separator");
    await expect(separator).toHaveCount(1);
    await expect(separator).toHaveAttribute("role", "presentation");
    await expect(separator).toHaveAttribute("data-orientation", "horizontal");
});

test("autocomplete / lifecycle: the Input names the kept-mounted List while closed", async ({
    page,
}) => {
    await openScenario(page, "/autocomplete/lifecycle");
    const list = part(page, "autocomplete", "list");
    await expect(list).toHaveCount(1);
    const id = await list.getAttribute("id");
    expect(id).toBeTruthy();
    await expect(part(page, "autocomplete", "input")).toHaveAttribute(
        "aria-controls",
        id as string,
    );
});
