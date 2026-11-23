import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/toolbar.md: the parts, the orientation on every part, the disabled items, the one tab
// stop shared with the nested composites
test("toolbar / basic: the parts, their states and the one tab stop", async ({
    page,
}) => {
    await openScenario(page, "/toolbar/basic");
    const root = part(page, "toolbar", "root");
    await expect(root).toHaveAttribute("role", "toolbar");
    await expect(root).toHaveAttribute("aria-orientation", "horizontal");
    await expect(root).toHaveAttribute("data-orientation", "horizontal");
    await expect(root).not.toHaveAttribute("data-disabled");

    const group = part(root, "toolbar", "group");
    await expect(group).toHaveAttribute("role", "group");
    await expect(group).toHaveAttribute("data-orientation", "horizontal");
    const separators = part(root, "toolbar", "separator");
    await expect(separators).toHaveCount(2);
    for (const separator of await separators.all()) {
        await expect(separator).toHaveAttribute("role", "separator");
        await expect(separator).toHaveAttribute("aria-orientation", "vertical");
        await expect(separator).toHaveAttribute("data-orientation", "vertical");
        await expect(separator).not.toHaveAttribute("tabindex");
    }

    const buttons = part(root, "toolbar", "button");
    await expect(buttons).toHaveCount(3);
    for (const button of await buttons.all()) {
        await expect(button).toHaveAttribute("type", "button");
        await expect(button).toHaveAttribute("data-orientation", "horizontal");
        await expect(button).toHaveAttribute("tabindex", "-1");
    }
    const redo = buttons.nth(1);
    await expect(redo).toHaveAttribute("disabled", "");
    await expect(redo).toHaveAttribute("data-disabled", "");
    const share = buttons.nth(2);
    await expect(share).not.toHaveAttribute("disabled");
    await expect(share).toHaveAttribute("aria-disabled", "true");
    await expect(share).toHaveAttribute("data-disabled", "");
    const link = part(root, "toolbar", "link");
    await expect(link).toHaveAttribute("href", "#help");
    await expect(link).toHaveAttribute("tabindex", "-1");
    await expect(link).toHaveAttribute("data-orientation", "horizontal");
    const input = part(root, "toolbar", "input");
    await expect(input).toHaveAttribute("tabindex", "-1");
    await expect(input).toHaveAttribute("data-orientation", "horizontal");
    await expect(input).not.toHaveAttribute("data-disabled");

    // the ToggleGroup inside: the toolbar's orientation, its toggles the toolbar's items
    const toggleGroup = part(root, "toggle-group", "root");
    await expect(toggleGroup).toHaveAttribute("role", "group");
    await expect(toggleGroup).toHaveAttribute("data-orientation", "horizontal");
    await expect(toggleGroup).toHaveAttribute("data-multiple", "");
    const toggles = part(toggleGroup, "toggle", "root");
    await expect(toggles.nth(0)).toHaveAttribute("tabindex", "0");
    await expect(toggles.nth(1)).toHaveAttribute("tabindex", "-1");
    await expect(root.locator('[tabindex="0"]')).toHaveCount(1);

    // the tab stop follows the focus
    await input.focus();
    await expect(input).toHaveAttribute("tabindex", "0");
    await expect(toggles.nth(0)).toHaveAttribute("tabindex", "-1");
    await expect(root.locator('[tabindex="0"]')).toHaveCount(1);
    await expectNoFalseStates(parts(page, "toolbar"));
    await expectNoFalseStates(parts(page, "toggle-group"));
    await expectNoFalseStates(parts(page, "toggle"));
});

test("toolbar / vertical: the orientation of the parts and of the nested group", async ({
    page,
}) => {
    await openScenario(page, "/toolbar/vertical");
    const root = part(page, "toolbar", "root");
    await expect(root).toHaveAttribute("aria-orientation", "vertical");
    await expect(root).toHaveAttribute("data-orientation", "vertical");
    const separator = part(root, "toolbar", "separator");
    await expect(separator).toHaveAttribute("aria-orientation", "horizontal");
    await expect(separator).toHaveAttribute("data-orientation", "horizontal");
    await expect(part(root, "toolbar", "button").nth(0)).toHaveAttribute(
        "data-orientation",
        "vertical",
    );
    await expect(part(root, "toggle-group", "root")).toHaveAttribute(
        "data-orientation",
        "vertical",
    );
    const snap = part(root, "toggle", "root").nth(0);
    await expect(snap).toHaveAttribute("tabindex", "-1");
    await expect(root.locator('[tabindex="0"]')).toHaveCount(1);
    await expectNoFalseStates(parts(page, "toolbar"));
});
