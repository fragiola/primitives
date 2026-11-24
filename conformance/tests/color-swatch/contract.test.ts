import { expect, type Locator, test } from "@playwright/test";
import { part } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/color-swatch.md: the part, its role, its name and its CSS variables

/** A CSS variable of the element's inline (structural) style. */
function cssVariable(locator: Locator, name: string): Promise<string> {
    return locator.evaluate(
        (element, property) =>
            (element as HTMLElement).style.getPropertyValue(property),
        name,
    );
}

test("color-swatch / basic: the part, the img role, the color's variables", async ({
    page,
}) => {
    await openScenario(page, "/color-swatch/basic");
    const swatches = part(page, "color-swatch", "root");
    await expect(swatches).toHaveCount(3);
    const colors = [
        "rgb(51, 102, 153)",
        "rgba(255, 0, 0, 0.5)",
        "hsl(120, 100%, 25%)",
    ];
    for (const [index, color] of colors.entries()) {
        const swatch = swatches.nth(index);
        await expect(swatch).toHaveAttribute("role", "img");
        expect(await cssVariable(swatch, "--color-swatch-color")).toBe(color);
    }
    await expect(swatches.nth(0)).toHaveAttribute("aria-label", "Ocean");
    await expect(swatches.nth(1)).toHaveAttribute(
        "aria-label",
        "rgba(255, 0, 0, 0.5)",
    );
    expect(
        await cssVariable(swatches.nth(1), "--color-swatch-color-opaque"),
    ).toBe("rgb(255, 0, 0)");
});
