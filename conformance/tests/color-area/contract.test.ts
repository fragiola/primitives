import { expect, type Locator, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { dragFrom } from "../../src/pointer.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/color-area.md: anatomy, the two range inputs, the structural styles and their variables
/** A CSS variable of the element's inline (structural) style. */
function cssVariable(locator: Locator, name: string): Promise<string> {
    return locator.evaluate(
        (element, property) =>
            (element as HTMLElement).style.getPropertyValue(property),
        name,
    );
}

test("color-area / basic: parts, the inputs, the background, the thumb's place, dragging", async ({
    page,
}) => {
    await openScenario(page, "/color-area/basic");
    const root = part(page, "color-area", "root");
    await expect(root).toHaveAttribute("role", "group");
    await expect(root).toHaveCSS("touch-action", "none");
    expect(await cssVariable(root, "--color-area-background")).toBe(
        "linear-gradient(to top, rgb(0, 0, 0), rgba(0, 0, 0, 0)), linear-gradient(to right, hsl(210, 0%, 100%), hsl(210, 100%, 50%))",
    );
    expect(await cssVariable(root, "--color-area-background-blend-mode")).toBe(
        "normal",
    );
    const inputs = part(page, "color-area", "input");
    await expect(inputs).toHaveCount(2);
    const [x, y] = [inputs.nth(0), inputs.nth(1)];
    for (const [input, axis, channel, orientation] of [
        [x, "x", "saturation", "horizontal"],
        [y, "y", "brightness", "vertical"],
    ] as const) {
        await expect(input).toHaveAttribute("type", "range");
        await expect(input).toHaveAttribute("min", "0");
        await expect(input).toHaveAttribute("max", "100");
        await expect(input).toHaveAttribute("step", "1");
        await expect(input).toHaveValue("50");
        await expect(input).toHaveAttribute("aria-orientation", orientation);
        await expect(input).toHaveAttribute("data-axis", axis);
        await expect(input).toHaveAttribute("data-channel", channel);
        await expect(input).toHaveCSS("position", "absolute");
        await expect(input).toHaveCSS("pointer-events", "none");
    }
    await expect(x).toHaveAttribute("name", "saturation");
    const thumb = part(page, "color-area", "thumb");
    await expect(thumb).toHaveCSS("inset-inline-start", "100px");
    await expect(thumb).toHaveCSS("inset-block-end", "100px");
    expect(await cssVariable(thumb, "--color-area-thumb-color")).toBe(
        "hsl(210, 33.33%, 37.5%)",
    );

    const box = await root.boundingBox();
    const { x: left, y: top } = box as NonNullable<typeof box>;
    await dragFrom(page, thumb, {
        x: Math.round(left + 50),
        y: Math.round(top + 150),
    });
    await expect(root).toHaveAttribute("data-dragging", "");
    await expect(thumb).toHaveAttribute("data-dragging", "");
    await expectNoFalseStates(parts(page, "color-area"));
    await page.mouse.up();
    await expect(root).not.toHaveAttribute("data-dragging");
    await expect(x).toHaveValue("25");
    await expect(y).toHaveValue("25");
    await expect(thumb).toHaveCSS("inset-inline-start", "50px");
    await expect(thumb).toHaveCSS("inset-block-end", "50px");
    await expectNoFalseStates(parts(page, "color-area"));
});

test("color-area / rtl: the x ramp runs to the left", async ({ page }) => {
    await openScenario(page, "/color-area/rtl", { dir: "rtl" });
    await expect
        .poll(() =>
            cssVariable(
                part(page, "color-area", "root"),
                "--color-area-background",
            ),
        )
        .toContain("linear-gradient(to left, hsl(210, 0%, 100%)");
});

test("color-area / rgb: two rgb channels blend through screen", async ({
    page,
}) => {
    await openScenario(page, "/color-area/rgb");
    const root = part(page, "color-area", "root");
    expect(await cssVariable(root, "--color-area-background-blend-mode")).toBe(
        "screen",
    );
    expect(await cssVariable(root, "--color-area-background")).toBe(
        "linear-gradient(to right, rgb(0, 0, 128), rgb(255, 0, 128)), linear-gradient(to top, rgb(0, 0, 0), rgb(0, 255, 0))",
    );
    await expect(part(page, "color-area", "input").nth(0)).toHaveAttribute(
        "max",
        "255",
    );
});
