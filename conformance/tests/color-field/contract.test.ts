import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/color-field.md: anatomy, the Input's attributes in both modes, the hidden input
test("color-field / basic: the textbox and the hidden input", async ({
    page,
}) => {
    await openScenario(page, "/color-field/basic");
    const input = part(page, "color-field", "input");
    await expect(input).toHaveAttribute("id", "color");
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).toHaveAttribute("autocomplete", "off");
    await expect(input).toHaveAttribute("spellcheck", "false");
    await expect(input).not.toHaveAttribute("role");
    await expect(input).not.toHaveAttribute("aria-valuenow");
    const hidden = part(page, "color-field", "hidden-input");
    await expect(hidden).toHaveAttribute("aria-hidden", "true");
    await expect(hidden).toHaveAttribute("tabindex", "-1");
    await expect(hidden).toHaveAttribute("name", "color");
    await expect(hidden).toHaveValue("#336699");
    await expect(hidden).toHaveCSS("position", "absolute");
    await expect(part(page, "color-field", "root")).not.toHaveAttribute(
        "data-channel",
    );
    await expectNoFalseStates(parts(page, "color-field"));
});

test("color-field / channel: the spinbutton and the channel's number", async ({
    page,
}) => {
    await openScenario(page, "/color-field/channel");
    const input = part(page, "color-field", "input");
    await expect(input).toHaveAttribute("role", "spinbutton");
    await expect(input).toHaveAttribute("inputmode", "decimal");
    for (const element of [part(page, "color-field", "root"), input]) {
        await expect(element).toHaveAttribute("data-channel", "hue");
    }
    await expect(part(page, "color-field", "hidden-input")).toHaveValue("120");
    await expectNoFalseStates(parts(page, "color-field"));
});
