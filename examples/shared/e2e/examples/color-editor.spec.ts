import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// color-editor: an HSL editor (spec/color.md and the four color specs), one color shared by four
// controls, starting at hsl(210, 80%, 50%): a ColorWheel (Thumb "Hue", `colorSpace="hsl"`), a
// ColorArea named "Saturation and lightness" (Inputs "Saturation" and "Lightness"), a ColorSlider
// for the alpha (Label "Opacity", with its Output) and a hex ColorField labelled "Hex"; then a
// swatch and an `output` with the color as CSS (`formatColor(color, "css")`).

test("every control edits the one color", async ({ page }) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "color-editor" });
    const hue = frame.getByRole("slider", { name: "Hue" });
    const saturation = frame.getByRole("slider", { name: "Saturation" });
    const lightness = frame.getByRole("slider", { name: "Lightness" });
    const opacity = frame.getByRole("slider", { name: "Opacity" });
    const hex = frame.getByRole("textbox", { name: "Hex" });
    const css = frame.locator("output").last();
    await expect(hue).toHaveAttribute(
        "data-primitives-part",
        "color-wheel-thumb",
    );
    await expect(hue).toHaveAttribute("aria-valuenow", "210");
    await expect(saturation).toHaveValue("80");
    await expect(lightness).toHaveValue("50");
    await expect(opacity).toHaveAttribute("aria-valuetext", "100%");
    await expect(hex).toHaveValue("#1a80e6");
    await expect(css).toHaveText("hsl(210, 80%, 50%)");

    await hue.focus();
    await page.keyboard.press("PageUp");
    await expect(hue).toHaveAttribute("aria-valuenow", "225");
    await expect(css).toHaveText("hsl(225, 80%, 50%)");
    await saturation.focus();
    await page.keyboard.press("Home");
    await expect(saturation).toHaveValue("0");
    await page.keyboard.press("ArrowUp");
    await expect(lightness).toHaveValue("51");
    await expect(lightness).toBeFocused();
    await expect(css).toHaveText("hsl(225, 0%, 51%)");
    await opacity.focus();
    await page.keyboard.press("PageDown");
    await expect(opacity).toHaveAttribute("aria-valuetext", "90%");
    await expect(css).toHaveText("hsla(225, 0%, 51%, 0.9)");

    await hex.fill("#ff8000");
    await hex.press("Enter");
    await expect(css).toHaveText("rgb(255, 128, 0)");
    await expect(hue).toHaveAttribute("aria-valuenow", "30.12");
    await expect(saturation).toHaveValue("100");
    // an emptied field keeps the color
    await hex.fill("");
    await hex.press("Tab");
    await expect(hex).toHaveValue("#ff8000");
    expect(errors).toEqual([]);
});

test("a press on the area and on the ring", async ({ page }) => {
    const frame = await openHosted(page, { id: "color-editor" });
    const area = frame.locator('[data-primitives-part="color-area-root"]');
    const box = await area.boundingBox();
    expect(box).not.toBeNull();
    const { x, y, width, height } = box as NonNullable<typeof box>;
    await page.mouse.click(
        Math.round(x + width * 0.25),
        Math.round(y + height * 0.25),
    );
    await expect(frame.getByRole("slider", { name: "Saturation" })).toHaveValue(
        "25",
    );
    await expect(frame.getByRole("slider", { name: "Lightness" })).toHaveValue(
        "75",
    );
    const wheel = frame.locator('[data-primitives-part="color-wheel-root"]');
    const ring = await wheel.boundingBox();
    expect(ring).not.toBeNull();
    const r = ring as NonNullable<typeof ring>;
    // the ring's bottom: hue 180
    await page.mouse.click(
        Math.round(r.x + r.width / 2),
        Math.round(r.y + r.height - 10),
    );
    await expect(frame.getByRole("slider", { name: "Hue" })).toHaveAttribute(
        "aria-valuenow",
        "180",
    );
    await expect(frame.locator("output").last()).toHaveText(
        "hsl(180, 25%, 75%)",
    );
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("color-editor");
    await page.goto(`${EMBED_BASE}?id=color-editor`);
    await expect(page.getByRole("slider")).toHaveCount(4);
    expect(await axeViolations(page)).toEqual([]);
});
