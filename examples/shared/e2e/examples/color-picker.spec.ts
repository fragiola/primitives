import { expect, type FrameLocator, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// color-picker: a theme color picker (spec/color-picker.md), starting at #7c3aed. A trigger shows
// a ColorSwatch, "Theme color" and the hex (its name); its popup ("Theme color picker") holds a ColorArea
// (Inputs "Saturation" and "Brightness"), a hue ("Hue") and an opacity ("Opacity") ColorSlider,
// a FormatSelect ("Format") with the fields of its format (a hex ColorField "Hex", or three
// channel ColorFields: "Red", "Green", "Blue" for RGB), a ColorSwatchPicker "Presets" and the
// eyedropper's trigger. Every control is bound to the picker.

const trigger = (frame: FrameLocator) =>
    frame.getByRole("button", { name: /^Theme color/ });

test("the popup's controls edit the one color the trigger shows", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "color-picker" });
    await expect(trigger(frame)).toHaveText("Theme color#7c3aed");
    await expect(trigger(frame)).toHaveAttribute(
        "data-primitives-part",
        "color-picker-popover-trigger",
    );
    await trigger(frame).click();
    const dialog = frame.getByRole("dialog", { name: "Theme color picker" });
    await expect(dialog).toBeVisible();
    await expect(
        frame.getByRole("slider", { name: "Saturation" }),
    ).toBeFocused();
    await expect(frame.getByRole("textbox", { name: "Hex" })).toHaveValue(
        "#7c3aed",
    );

    const hue = frame.getByRole("slider", { name: "Hue" });
    await hue.focus();
    await page.keyboard.press("PageUp");
    await expect(hue).toHaveAttribute("aria-valuenow", "277");
    await expect(trigger(frame)).toContainText("#a83aed");

    await frame.getByRole("combobox", { name: "Format" }).selectOption("rgb");
    await expect(frame.getByRole("textbox", { name: "Hex" })).toHaveCount(0);
    const red = frame.getByRole("spinbutton", { name: "Red" });
    await expect(red).toHaveValue("168");
    await red.fill("255");
    await red.press("Enter");
    await expect(trigger(frame)).toContainText("#ff3aed");

    await frame.getByRole("option", { name: "Teal" }).click();
    await expect(trigger(frame)).toContainText("#0d9488");
    await expect(frame.getByRole("option", { name: "Teal" })).toHaveAttribute(
        "aria-selected",
        "true",
    );
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger(frame)).toBeFocused();
    expect(errors).toEqual([]);
});

test("axe finds no violation, with the popup open", async ({ page }) => {
    requireExamples("color-picker");
    await page.goto(`${EMBED_BASE}?id=color-picker`);
    await page.getByRole("button", { name: /^Theme color/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
