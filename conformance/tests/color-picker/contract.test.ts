import { expect, type Locator, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";
import { stubEyeDropper } from "./eye-dropper.ts";

// spec/color-picker.md: anatomy, ARIA, the bound controls' form values, the popup's parts

/** A CSS variable of the element's inline (structural) style. */
function cssVariable(locator: Locator, name: string): Promise<string> {
    return locator.evaluate(
        (element, property) =>
            (element as HTMLElement).style.getPropertyValue(property),
        name,
    );
}

test("color-picker / basic: the parts, the format, the only named input", async ({
    page,
}) => {
    await stubEyeDropper(page, "#336699");
    await openScenario(page, "/color-picker/basic");
    const root = part(page, "color-picker", "root");
    await expect(root).toHaveAttribute("role", "group");
    await expect(root).toHaveAttribute("data-format", "hex");
    expect(await cssVariable(root, "--color-picker-color")).toBe(
        "hsl(210, 33.33%, 45%)",
    );
    const select = part(page, "color-picker", "format-select");
    await expect(select).toHaveJSProperty("tagName", "SELECT");
    await expect(select).toHaveAttribute("data-format", "hex");
    const trigger = part(page, "color-picker", "eye-dropper-trigger");
    await expect(trigger).toHaveAttribute("type", "button");
    const input = part(page, "color-picker", "input");
    await expect(input).toHaveAttribute("type", "hidden");
    await expect(input).toHaveAttribute("name", "color");
    await expect(input).toHaveValue("#4d7399");
    // the bound controls submit nothing of their own; the swatch shows the picker's color
    await expect(page.locator("form [name]")).toHaveCount(1);
    expect(
        await cssVariable(
            part(page, "color-swatch", "root").first(),
            "--color-swatch-color",
        ),
    ).toBe("hsl(210, 33.33%, 45%)");
    await select.selectOption("rgb");
    await expect(root).toHaveAttribute("data-format", "rgb");
    await expect(select).toHaveAttribute("data-format", "rgb");
    await expectNoFalseStates(parts(page, "color-picker"));
});

test("color-picker / popover: the trigger, the positioner and the popup", async ({
    page,
}) => {
    await openScenario(page, "/color-picker/popover");
    const trigger = part(page, "color-picker-popover", "trigger");
    await expect(trigger).toHaveAttribute("type", "button");
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).not.toHaveAttribute("aria-controls");
    expect(
        await cssVariable(
            part(trigger, "color-swatch", "root"),
            "--color-swatch-color",
        ),
    ).toBe("rgb(51, 102, 153)");
    await trigger.click();
    const popup = part(page, "color-picker-popover", "popup");
    await expect(popup).toHaveAttribute("role", "dialog");
    await expect(popup).not.toHaveAttribute("aria-modal");
    await expect(popup).toHaveAttribute("tabindex", "-1");
    await expect(popup).toHaveAttribute("data-open", "");
    await expect(popup).toHaveAttribute("data-side", "bottom");
    await expect(popup).toHaveAttribute("data-align", "start");
    await expect(trigger).toHaveAttribute(
        "aria-controls",
        (await popup.getAttribute("id")) as string,
    );
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    const positioner = part(page, "color-picker-popover", "positioner");
    await expect(positioner).toHaveAttribute("role", "presentation");
    await expect(positioner).toHaveAttribute("data-side", "bottom");
    await expectNoFalseStates(parts(page, "color-picker-popover"));
    await page.keyboard.press("Escape");
    await expect(popup).toHaveCount(0);
    await expect(trigger).not.toHaveAttribute("data-popup-open");
    // the hidden input stays while the popup is closed
    await expect(part(page, "color-picker", "input")).toHaveValue("#336699");
});

test("color-picker / disabled: data-disabled on the picker's parts", async ({
    page,
}) => {
    await stubEyeDropper(page, "#336699");
    await openScenario(page, "/color-picker/disabled");
    await expect(part(page, "color-picker", "root")).toHaveAttribute(
        "data-disabled",
        "",
    );
    await expect(part(page, "color-picker", "format-select")).toHaveAttribute(
        "data-disabled",
        "",
    );
    await expect(
        part(page, "color-picker", "eye-dropper-trigger"),
    ).toHaveAttribute("data-disabled", "");
    await expect(part(page, "color-picker-popover", "trigger")).toHaveAttribute(
        "data-disabled",
        "",
    );
    await expect(part(page, "color-swatch-picker", "root")).toHaveAttribute(
        "data-disabled",
        "",
    );
    await expectNoFalseStates(parts(page, "color-picker"));
});
