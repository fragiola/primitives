import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/password-input.md: anatomy, state attributes and ARIA
test("password-input / basic: parts and states", async ({ page }) => {
    await openScenario(page, "/password-input/basic");
    const root = part(page, "password-input", "root");
    const input = part(page, "password-input", "input");
    const trigger = part(page, "password-input", "visibility-trigger");
    await expect(root).toHaveCount(1);
    await expect(input).toHaveAttribute("id", "password");
    await expect(input).toHaveAttribute("name", "password");
    await expect(input).toHaveAttribute("type", "password");
    await expect(trigger).toHaveAttribute("type", "button");
    await expect(trigger).toHaveAttribute("aria-pressed", "false");
    await expect(trigger).toHaveAttribute("aria-controls", "password");
    for (const element of [root, input, trigger]) {
        await expect(element).not.toHaveAttribute("data-visible");
        await expect(element).not.toHaveAttribute("data-disabled");
    }
    await expectNoFalseStates(parts(page, "password-input"));

    await trigger.click();
    for (const element of [root, input, trigger]) {
        await expect(element).toHaveAttribute("data-visible", "");
    }
    await expect(input).toHaveAttribute("type", "text");
    await expectNoFalseStates(parts(page, "password-input"));
});

test("password-input / states: disabled and read-only", async ({ page }) => {
    await openScenario(page, "/password-input/states");
    const roots = part(page, "password-input", "root");
    const pin = roots.nth(0);
    const recovery = roots.nth(1);
    for (const element of [
        pin,
        part(pin, "password-input", "input"),
        part(pin, "password-input", "visibility-trigger"),
    ]) {
        await expect(element).toHaveAttribute("data-disabled", "");
        await expect(element).not.toHaveAttribute("data-visible");
    }
    await expect(
        part(pin, "password-input", "visibility-trigger"),
    ).toHaveAttribute("disabled", "");
    for (const element of [
        recovery,
        part(recovery, "password-input", "input"),
        part(recovery, "password-input", "visibility-trigger"),
    ]) {
        await expect(element).toHaveAttribute("data-readonly", "");
        await expect(element).toHaveAttribute("data-visible", "");
        await expect(element).not.toHaveAttribute("data-disabled");
    }
    await expectNoFalseStates(parts(page, "password-input"));
});

test("password-input / field: the field's attributes on the Input", async ({
    page,
}) => {
    await openScenario(page, "/password-input/field");
    const input = part(page, "password-input", "input");
    await expect(input).toHaveAttribute("aria-labelledby", /.+/);
    await expect(input).toHaveAttribute("aria-describedby", /.+/);
    await expect(input).toHaveAttribute("required", "");
    await expect(input).toHaveAttribute("data-required", "");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(input).toHaveAttribute("data-invalid", "");
    await expect(part(page, "password-input", "root")).toHaveAttribute(
        "data-invalid",
        "",
    );
    await expectNoFalseStates(parts(page, "password-input"));
});
