import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/search-field.md: anatomy, state attributes and ARIA
test("search-field / basic: parts and states", async ({ page }) => {
    await openScenario(page, "/search-field/basic");
    const root = part(page, "search-field", "root");
    const input = part(page, "search-field", "input");
    const clear = part(page, "search-field", "clear-button");
    await expect(root).toHaveCount(1);
    await expect(input).toHaveAttribute("type", "search");
    await expect(input).toHaveAttribute("id", "search");
    await expect(input).toHaveAttribute("name", "q");
    await expect(clear).toHaveAttribute("type", "button");
    await expect(clear).toHaveAttribute("tabindex", "-1");
    await expect(clear).toHaveAttribute("aria-controls", "search");
    for (const element of [root, input, clear]) {
        await expect(element).toHaveAttribute("data-empty", "");
        await expect(element).not.toHaveAttribute("data-disabled");
        await expect(element).not.toHaveAttribute("data-readonly");
    }
    await expectNoFalseStates(parts(page, "search-field"));

    await input.fill("lamp");
    for (const element of [root, input, clear]) {
        await expect(element).not.toHaveAttribute("data-empty");
    }
    await expectNoFalseStates(parts(page, "search-field"));
});

test("search-field / states: disabled and read-only", async ({ page }) => {
    await openScenario(page, "/search-field/states");
    const roots = part(page, "search-field", "root");
    for (const [index, state] of [
        [0, "data-disabled"],
        [1, "data-readonly"],
    ] as const) {
        const root = roots.nth(index);
        for (const element of [
            root,
            part(root, "search-field", "input"),
            part(root, "search-field", "clear-button"),
        ]) {
            await expect(element).toHaveAttribute(state, "");
            await expect(element).not.toHaveAttribute("data-empty");
        }
        await expect(
            part(root, "search-field", "clear-button"),
        ).toHaveAttribute("disabled", "");
    }
    await expectNoFalseStates(parts(page, "search-field"));
});

test("search-field / field: the field's attributes on the Input", async ({
    page,
}) => {
    await openScenario(page, "/search-field/field");
    const input = part(page, "search-field", "input");
    await expect(input).toHaveAttribute("aria-labelledby", /.+/);
    await expect(input).toHaveAttribute("aria-describedby", /.+/);
    await expect(input).toHaveAttribute("data-required", "");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(input).toHaveAttribute("data-invalid", "");
    await expectNoFalseStates(parts(page, "search-field"));
});
