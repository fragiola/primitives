import { expect, type Locator, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { dragFrom } from "../../src/pointer.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/color-wheel.md: anatomy, ARIA, the structural styles and their variables, the hidden input
/** A CSS variable of the element's inline (structural) style. */
function cssVariable(locator: Locator, name: string): Promise<string> {
    return locator.evaluate(
        (element, property) =>
            (element as HTMLElement).style.getPropertyValue(property),
        name,
    );
}

test("color-wheel / basic: parts, ARIA, the ring, the thumb's place, dragging", async ({
    page,
}) => {
    await openScenario(page, "/color-wheel/basic");
    const root = part(page, "color-wheel", "root");
    await expect(root).toHaveCSS("width", "200px");
    await expect(root).toHaveCSS("height", "200px");
    await expect(root).toHaveCSS("touch-action", "none");
    expect(await cssVariable(root, "--color-wheel-outer-radius")).toBe("100px");
    expect(await cssVariable(root, "--color-wheel-inner-radius")).toBe("76px");
    const track = part(page, "color-wheel", "track");
    await expect(track).toHaveCSS("position", "absolute");
    expect(await cssVariable(track, "--color-wheel-track-background")).toBe(
        "conic-gradient(hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))",
    );
    const thumb = part(page, "color-wheel", "thumb");
    await expect(thumb).toHaveAttribute("role", "slider");
    await expect(thumb).toHaveAttribute("tabindex", "0");
    await expect(thumb).toHaveAttribute("aria-valuemin", "0");
    await expect(thumb).toHaveAttribute("aria-valuemax", "360");
    await expect(thumb).toHaveAttribute("aria-valuenow", "90");
    expect(
        await thumb.evaluate((element) => (element as HTMLElement).style.left),
    ).toBe("calc(50% + 88px)");
    expect(await cssVariable(thumb, "--color-wheel-thumb-color")).toBe(
        "hsl(90, 100%, 50%)",
    );
    const input = part(page, "color-wheel", "input");
    await expect(input).toHaveAttribute("type", "hidden");
    await expect(input).toHaveAttribute("name", "color");
    await expect(input).toHaveValue("#80ff00");

    const box = await root.boundingBox();
    const { x, y } = box as NonNullable<typeof box>;
    await dragFrom(page, thumb, {
        x: Math.round(x + 100),
        y: Math.round(y + 188),
    });
    await expect(root).toHaveAttribute("data-dragging", "");
    await expect(thumb).toHaveAttribute("data-dragging", "");
    await expectNoFalseStates(parts(page, "color-wheel"));
    await page.mouse.up();
    await expect(root).not.toHaveAttribute("data-dragging");
    await expect(input).toHaveValue("#00ffff");
    await expectNoFalseStates(parts(page, "color-wheel"));
});

test("color-wheel / disabled: every part says so", async ({ page }) => {
    await openScenario(page, "/color-wheel/disabled");
    for (const name of ["root", "track", "thumb"]) {
        await expect(part(page, "color-wheel", name)).toHaveAttribute(
            "data-disabled",
            "",
        );
    }
    await expectNoFalseStates(parts(page, "color-wheel"));
});
