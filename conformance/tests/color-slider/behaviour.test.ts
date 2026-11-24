import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { dragFrom, pointAlong, pressAlong } from "../../src/pointer.ts";
import { openScenario } from "../../src/scenario.ts";
import { expectSliderValue, sliderState } from "../../src/slider.ts";

// spec/color-slider.md
const slider = (page: Page, name: string) =>
    page.getByRole("slider", { name, exact: true });
const track = (page: Page) => page.getByTestId("track");
const hue = (value: number) => `hsl(${value}, 100%, 50%)`;

test.describe("color-slider / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/color-slider/basic");
    });

    test("a group and a slider named by the Label, with the channel's value and text", async ({
        page,
    }) => {
        await expect(page.getByRole("group", { name: "Hue" })).toBeVisible();
        await expect(page.getByRole("slider")).toHaveCount(1);
        expect(await sliderState(slider(page, "Hue"))).toEqual({
            now: 0,
            min: 0,
            max: 360,
        });
        await expect(slider(page, "Hue")).toHaveAttribute(
            "aria-valuetext",
            "0°",
        );
        await expect(
            page.locator('[data-primitives-part="color-slider-output"]'),
        ).toHaveText("0°");
    });

    test("the arrows, Page Up and Down, Shift, Home and End", async ({
        page,
    }) => {
        const thumb = slider(page, "Hue");
        await thumb.focus();
        const steps: [string, number][] = [
            ["ArrowRight", 1],
            ["ArrowUp", 2],
            ["ArrowLeft", 1],
            ["ArrowDown", 0],
            ["PageUp", 15],
            ["PageDown", 0],
            ["Shift+ArrowRight", 15],
            ["End", 360],
            ["Home", 0],
        ];
        for (const [key, value] of steps) {
            await page.keyboard.press(key);
            await expectSliderValue(thumb, value);
            await expectOutput(page, "value", hue(value));
            await expectOutput(page, "committed", hue(value));
        }
        await expect(thumb).toHaveAttribute("aria-valuetext", "0°");
    });

    test("a press on the track moves the thumb there and focuses it", async ({
        page,
    }) => {
        await pressAlong(page, track(page), 0.5);
        await expectSliderValue(slider(page, "Hue"), 180);
        await expectOutput(page, "committed", hue(180));
        await expect(slider(page, "Hue")).toBeFocused();
    });

    test("a drag follows the pointer and commits on release", async ({
        page,
    }) => {
        const thumb = slider(page, "Hue");
        await dragFrom(page, thumb, await pointAlong(track(page), 0.75));
        await expectSliderValue(thumb, 270);
        await expectOutput(page, "value", hue(270));
        await expectOutput(page, "committed", "none");
        await page.mouse.up();
        await expectOutput(page, "committed", hue(270));
    });

    test("the form submits the color as hex", async ({ page }) => {
        await pressAlong(page, track(page), 0.5);
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "color=#00ffff");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("color-slider / alpha", () => {
    test("the alpha in percent, in the locale's text", async ({ page }) => {
        await openScenario(page, "/color-slider/alpha");
        const thumb = slider(page, "Opacity");
        expect(await sliderState(thumb)).toEqual({ now: 0.5, min: 0, max: 1 });
        await expect(thumb).toHaveAttribute("aria-valuetext", "50 %");
        const output = page.locator(
            '[data-primitives-part="color-slider-output"]',
        );
        await expect(output).toHaveText("50 %");
        await thumb.focus();
        await page.keyboard.press("ArrowRight");
        await expectSliderValue(thumb, 0.51);
        await expect(thumb).toHaveAttribute("aria-valuetext", "51 %");
        await page.keyboard.press("PageUp");
        await expectSliderValue(thumb, 0.61);
        await page.keyboard.press("End");
        await expectSliderValue(thumb, 1);
        await expect(output).toHaveText("100 %");
    });
});

test.describe("color-slider / vertical", () => {
    test("vertical keys and a press from the bottom", async ({ page }) => {
        await openScenario(page, "/color-slider/vertical");
        const thumb = slider(page, "Brightness");
        await expect(thumb).toHaveAttribute("aria-orientation", "vertical");
        await thumb.focus();
        await page.keyboard.press("ArrowUp");
        await expectSliderValue(thumb, 31);
        await page.keyboard.press("ArrowRight");
        await expectSliderValue(thumb, 32);
        await page.keyboard.press("ArrowDown");
        await expectSliderValue(thumb, 31);
        await expectOutput(page, "value", "hsb(210, 50%, 31%)");
        await pressAlong(page, track(page), 0.75, "vertical");
        await expectSliderValue(thumb, 75);
    });
});

test.describe("color-slider / rtl", () => {
    test("the arrows swap and the track runs from the right", async ({
        page,
    }) => {
        await openScenario(page, "/color-slider/rtl", { dir: "rtl" });
        const thumb = slider(page, "Hue");
        await thumb.focus();
        await page.keyboard.press("ArrowLeft");
        await expectSliderValue(thumb, 1);
        await page.keyboard.press("ArrowRight");
        await expectSliderValue(thumb, 0);
        await pressAlong(page, track(page), 0.25);
        await expectSliderValue(thumb, 270);
    });
});

test.describe("color-slider / space", () => {
    test("three sliders on one value, each reporting the color in its space", async ({
        page,
    }) => {
        await openScenario(page, "/color-slider/space");
        await expectSliderValue(slider(page, "Red"), 51);
        await expectSliderValue(slider(page, "Hue"), 210);
        await expectSliderValue(slider(page, "Lightness"), 40);
        await slider(page, "Lightness").focus();
        await page.keyboard.press("ArrowUp");
        await expectSliderValue(slider(page, "Lightness"), 41);
        await expectOutput(page, "value", "hsl(210, 50%, 41%)");
        await expectSliderValue(slider(page, "Red"), 52);
        await expectSliderValue(slider(page, "Hue"), 210);
        await slider(page, "Red").focus();
        await page.keyboard.press("Home");
        await expectSliderValue(slider(page, "Red"), 0);
        await expectOutput(page, "value", "rgb(0, 105, 157)");
    });
});
