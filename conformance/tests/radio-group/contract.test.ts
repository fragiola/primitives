import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/radio-group.md: anatomy, state attributes, the roving tab stop, the hidden inputs
test("radio-group / basic: parts, states, the tab stop and the hidden inputs", async ({
    page,
}) => {
    await openScenario(page, "/radio-group/basic");
    const group = part(page, "radio-group", "root");
    await expect(group).toHaveAttribute("role", "radiogroup");
    await expect(group).toHaveAttribute("aria-required", "true");
    await expect(group).toHaveAttribute("data-required", "");
    await expect(group).not.toHaveAttribute("aria-orientation");
    await expect(group).not.toHaveAttribute("data-orientation");
    await expect(group).not.toHaveAttribute("data-disabled");

    const roots = part(page, "radio", "root");
    await expect(roots).toHaveCount(4);
    // no radio checked: the first enabled one holds the tab stop
    await expect(roots.nth(0)).toHaveAttribute("tabindex", "0");
    for (const index of [1, 2, 3]) {
        await expect(roots.nth(index)).toHaveAttribute("tabindex", "-1");
    }
    for (const root of await roots.all()) {
        await expect(root).toHaveAttribute("type", "button");
        await expect(root).toHaveAttribute("aria-checked", "false");
        await expect(root).toHaveAttribute("data-unchecked", "");
        await expect(root).not.toHaveAttribute("data-checked");
        await expect(root).toHaveAttribute("data-required", "");
    }
    const team = page.getByRole("radio", { name: "Team" });
    await expect(team).toHaveAttribute("disabled", "");
    await expect(team).toHaveAttribute("data-disabled", "");
    await expect(part(page, "radio", "indicator")).toHaveCount(0);

    const inputs = part(page, "radio", "input");
    await expect(inputs).toHaveCount(4);
    const values = ["free", "pro", "team", "enterprise"];
    for (const [index, input] of (await inputs.all()).entries()) {
        await expect(input).toHaveAttribute("type", "radio");
        await expect(input).toHaveAttribute("name", "plan");
        await expect(input).toHaveAttribute("value", values[index] as string);
        await expect(input).toHaveAttribute("required", "");
        await expect(input).toHaveAttribute("aria-hidden", "true");
        await expect(input).toHaveAttribute("tabindex", "-1");
    }
    await expect(inputs.nth(2)).toHaveAttribute("disabled", "");

    const pro = page.getByRole("radio", { name: "Pro" });
    await pro.click();
    await expect(pro).toHaveAttribute("data-checked", "");
    await expect(pro).not.toHaveAttribute("data-unchecked");
    await expect(pro).toHaveAttribute("tabindex", "0");
    await expect(roots.nth(0)).toHaveAttribute("tabindex", "-1");
    const indicator = part(pro, "radio", "indicator");
    await expect(indicator).toHaveCount(1);
    await expect(indicator).toHaveAttribute("aria-hidden", "true");
    await expect(indicator).toHaveAttribute("data-checked", "");
    await expect(inputs.nth(1)).toBeChecked();
    await expect(inputs.nth(0)).not.toBeChecked();
    await expectNoFalseStates(parts(page, "radio"));
    await expectNoFalseStates(parts(page, "radio-group"));
});

test("radio-group / controlled: the orientation, and the checked radio's tab stop", async ({
    page,
}) => {
    await openScenario(page, "/radio-group/controlled");
    const group = part(page, "radio-group", "root");
    await expect(group).toHaveAttribute("aria-orientation", "horizontal");
    await expect(group).toHaveAttribute("data-orientation", "horizontal");
    await expect(group).not.toHaveAttribute("aria-required");
    await expect(group).not.toHaveAttribute("data-required");
    const medium = page.getByRole("radio", { name: "Medium" });
    await expect(medium).toHaveAttribute("tabindex", "0");
    await expect(medium).toHaveAttribute("data-checked", "");
    await expect(page.getByRole("radio", { name: "Small" })).toHaveAttribute(
        "tabindex",
        "-1",
    );
    // no name: the hidden inputs submit nothing
    for (const input of await part(page, "radio", "input").all()) {
        await expect(input).not.toHaveAttribute("name");
    }
    await expectNoFalseStates(parts(page, "radio"));
});
