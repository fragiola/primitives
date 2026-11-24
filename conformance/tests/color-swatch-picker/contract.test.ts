import { expect, type Locator, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/color-swatch-picker.md: anatomy, ARIA, the roving tab stop, the hidden input

/** A CSS variable of the element's inline (structural) style. */
function cssVariable(locator: Locator, name: string): Promise<string> {
    return locator.evaluate(
        (element, property) =>
            (element as HTMLElement).style.getPropertyValue(property),
        name,
    );
}

test("color-swatch-picker / basic: parts, roles, the tab stop, the item's color, the hidden input", async ({
    page,
}) => {
    await openScenario(page, "/color-swatch-picker/basic");
    const root = part(page, "color-swatch-picker", "root");
    await expect(root).toHaveAttribute("role", "listbox");
    await expect(root).toHaveAttribute("aria-orientation", "horizontal");
    const items = part(page, "color-swatch-picker", "item");
    await expect(items).toHaveCount(8);
    await expect(items.nth(0)).toHaveAttribute("role", "option");
    await expect(items.nth(0)).toHaveAttribute("tabindex", "0");
    await expect(items.nth(1)).toHaveAttribute("tabindex", "-1");
    await expect(items.nth(1)).toHaveAttribute("aria-selected", "false");
    await expect(items.nth(7)).toHaveAttribute("data-disabled", "");
    expect(
        await cssVariable(items.nth(1), "--color-swatch-picker-item-color"),
    ).toBe("rgb(255, 128, 0)");
    const input = part(page, "color-swatch-picker", "input");
    await expect(input).toHaveAttribute("type", "hidden");
    await expect(input).toHaveAttribute("name", "color");
    await expect(input).toHaveValue("");

    await items.nth(2).click();
    await expect(items.nth(2)).toHaveAttribute("aria-selected", "true");
    await expect(items.nth(2)).toHaveAttribute("tabindex", "0");
    await expect(items.nth(0)).toHaveAttribute("tabindex", "-1");
    await expect(input).toHaveValue("#ffff00");
    await expectNoFalseStates(parts(page, "color-swatch-picker"));
});
