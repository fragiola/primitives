import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/toggle-group.md: the group's part and states, its toggles' roving tab stop
test("toggle-group / basic: the group, its toggles and the roving tab stop", async ({
    page,
}) => {
    await openScenario(page, "/toggle-group/basic");
    const group = part(page, "toggle-group", "root");
    await expect(group).toHaveAttribute("role", "group");
    await expect(group).toHaveAttribute("data-orientation", "horizontal");
    await expect(group).not.toHaveAttribute("aria-orientation");
    await expect(group).not.toHaveAttribute("data-multiple");
    await expect(group).not.toHaveAttribute("data-disabled");

    const toggles = part(group, "toggle", "root");
    await expect(toggles).toHaveCount(4);
    // the first enabled toggle holds the tab stop
    await expect(toggles.nth(0)).toHaveAttribute("tabindex", "0");
    for (const index of [1, 2, 3]) {
        await expect(toggles.nth(index)).toHaveAttribute("tabindex", "-1");
    }
    await expect(toggles.nth(0)).toHaveAttribute("data-pressed", "");
    await expect(toggles.nth(3)).toHaveAttribute("disabled", "");
    await expect(toggles.nth(3)).toHaveAttribute("data-disabled", "");

    // a click moves the tab stop to the pressed toggle
    await toggles.nth(1).click();
    await expect(toggles.nth(1)).toHaveAttribute("tabindex", "0");
    await expect(toggles.nth(1)).toHaveAttribute("data-pressed", "");
    await expect(toggles.nth(0)).toHaveAttribute("tabindex", "-1");
    await expect(toggles.nth(0)).not.toHaveAttribute("data-pressed");
    await expectNoFalseStates(parts(page, "toggle-group"));
    await expectNoFalseStates(parts(page, "toggle"));
});

test("toggle-group / vertical: the orientation and multiple", async ({
    page,
}) => {
    await openScenario(page, "/toggle-group/vertical");
    const group = part(page, "toggle-group", "root");
    await expect(group).toHaveAttribute("data-orientation", "vertical");
    await expect(group).toHaveAttribute("data-multiple", "");
    await expect(group).not.toHaveAttribute("aria-orientation");
    await expectNoFalseStates(parts(page, "toggle-group"));
});
