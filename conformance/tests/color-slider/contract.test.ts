import { expect, type Locator, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { dragFrom, pointAlong } from "../../src/pointer.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/color-slider.md: anatomy, ARIA, the structural styles and their variables, the hidden input
const HUES =
    "hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%)";

/** A CSS variable of the element's inline (structural) style. */
function cssVariable(locator: Locator, name: string): Promise<string> {
    return locator.evaluate(
        (element, property) =>
            (element as HTMLElement).style.getPropertyValue(property),
        name,
    );
}

test("color-slider / basic: parts, ARIA, the gradient, the hidden input, dragging", async ({
    page,
}) => {
    await openScenario(page, "/color-slider/basic");
    const root = part(page, "color-slider", "root");
    await expect(root).toHaveAttribute("role", "group");
    const label = part(page, "color-slider", "label");
    const labelId = (await label.getAttribute("id")) as string;
    await expect(root).toHaveAttribute("aria-labelledby", labelId);
    const thumb = part(page, "color-slider", "thumb");
    await expect(thumb).toHaveAttribute("role", "slider");
    await expect(thumb).toHaveAttribute("tabindex", "0");
    await expect(thumb).toHaveAttribute("aria-labelledby", labelId);
    await expect(thumb).toHaveAttribute("aria-valuenow", "0");
    await expect(thumb).toHaveAttribute("aria-valuemax", "360");
    await expect(thumb).toHaveAttribute("aria-orientation", "horizontal");
    const output = part(page, "color-slider", "output");
    await expect(output).toHaveJSProperty("tagName", "OUTPUT");
    await expect(output).toHaveAttribute(
        "for",
        (await thumb.getAttribute("id")) as string,
    );
    await expect(output).toHaveAttribute("aria-live", "off");
    for (const element of [root, label, output, thumb]) {
        await expect(element).toHaveAttribute("data-channel", "hue");
        await expect(element).toHaveAttribute("data-orientation", "horizontal");
    }
    const track = part(page, "color-slider", "track");
    expect(await cssVariable(track, "--color-slider-track-background")).toBe(
        `linear-gradient(to right, ${HUES})`,
    );
    await expect(track).toHaveCSS("touch-action", "none");
    expect(await cssVariable(thumb, "--color-slider-thumb-color")).toBe(
        "hsl(0, 100%, 50%)",
    );
    await expect(thumb).toHaveCSS("position", "absolute");
    const input = part(page, "color-slider", "input");
    await expect(input).toHaveAttribute("type", "hidden");
    await expect(input).toHaveAttribute("name", "color");
    await expect(input).toHaveValue("#ff0000");

    await dragFrom(page, thumb, await pointAlong(track, 0.5));
    await expect(root).toHaveAttribute("data-dragging", "");
    await expect(thumb).toHaveAttribute("data-dragging", "");
    await expect(track).toHaveAttribute("data-dragging", "");
    await expectNoFalseStates(parts(page, "color-slider"));
    await page.mouse.up();
    await expect(root).not.toHaveAttribute("data-dragging");
    await expect(input).toHaveValue("#00ffff");
    expect(await cssVariable(thumb, "--color-slider-thumb-color")).toBe(
        "hsl(180, 100%, 50%)",
    );
    await expectNoFalseStates(parts(page, "color-slider"));
});

test("color-slider / alpha: the alpha track and the thumb's color", async ({
    page,
}) => {
    await openScenario(page, "/color-slider/alpha");
    const track = part(page, "color-slider", "track");
    await expect(track).toHaveAttribute("data-channel", "alpha");
    expect(await cssVariable(track, "--color-slider-track-background")).toBe(
        "linear-gradient(to right, rgba(51, 102, 153, 0), rgb(51, 102, 153))",
    );
    const thumb = part(page, "color-slider", "thumb");
    expect(await cssVariable(thumb, "--color-slider-thumb-color")).toBe(
        "rgba(51, 102, 153, 0.5)",
    );
    await thumb.focus();
    await page.keyboard.press("End");
    await expect(thumb).toHaveAttribute("aria-valuenow", "1");
    expect(await cssVariable(thumb, "--color-slider-thumb-color")).toBe(
        "rgb(51, 102, 153)",
    );
});

test("color-slider / vertical: the gradient runs to the top", async ({
    page,
}) => {
    await openScenario(page, "/color-slider/vertical");
    await expect(part(page, "color-slider", "root")).toHaveAttribute(
        "data-orientation",
        "vertical",
    );
    expect(
        await cssVariable(
            part(page, "color-slider", "track"),
            "--color-slider-track-background",
        ),
    ).toBe("linear-gradient(to top, hsl(210, 0%, 0%), hsl(210, 100%, 75%))");
});

test("color-slider / rtl: the gradient runs to the left", async ({ page }) => {
    await openScenario(page, "/color-slider/rtl", { dir: "rtl" });
    await expect
        .poll(() =>
            cssVariable(
                part(page, "color-slider", "track"),
                "--color-slider-track-background",
            ),
        )
        .toBe(`linear-gradient(to left, ${HUES})`);
});
