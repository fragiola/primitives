import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { dragFrom } from "../../src/pointer.ts";
import { openScenario } from "../../src/scenario.ts";
import { expectSliderValue, sliderState } from "../../src/slider.ts";

// spec/color-area.md
const slider = (page: Page, name: string) =>
    page.getByRole("slider", { name, exact: true });
const area = (page: Page) => page.getByTestId("area");

/** The page point at fractions of the area's box, from its left and its top, on whole pixels. */
async function pointIn(
    locator: Locator,
    fromLeft: number,
    fromTop: number,
): Promise<{ x: number; y: number }> {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    const { x, y, width, height } = box as NonNullable<typeof box>;
    return {
        x: Math.round(x + width * fromLeft),
        y: Math.round(y + height * fromTop),
    };
}

async function pressIn(page: Page, fromLeft: number, fromTop: number) {
    const point = await pointIn(area(page), fromLeft, fromTop);
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.up();
}

test.describe("color-area / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/color-area/basic");
    });

    test("a named group with two sliders, one tab stop", async ({ page }) => {
        await expect(page.getByRole("group", { name: "Color" })).toBeVisible();
        await expect(page.getByRole("slider")).toHaveCount(2);
        expect(await sliderState(slider(page, "Saturation"))).toEqual({
            now: 50,
            min: 0,
            max: 100,
        });
        await expect(slider(page, "Saturation")).toHaveAttribute(
            "aria-valuetext",
            "50%",
        );
        await expectSliderValue(slider(page, "Brightness"), 50);
        await expect(slider(page, "Saturation")).toHaveAttribute(
            "tabindex",
            "0",
        );
        await expect(slider(page, "Brightness")).toHaveAttribute(
            "tabindex",
            "-1",
        );
    });

    test("the arrows move both axes and the focus follows the axis", async ({
        page,
    }) => {
        const saturation = slider(page, "Saturation");
        const brightness = slider(page, "Brightness");
        await saturation.focus();
        await page.keyboard.press("ArrowRight");
        await expectSliderValue(saturation, 51);
        await expectOutput(page, "value", "hsb(210, 51%, 50%)");
        await expectOutput(page, "committed", "hsb(210, 51%, 50%)");
        await page.keyboard.press("ArrowUp");
        await expectSliderValue(brightness, 51);
        await expect(brightness).toBeFocused();
        await expect(brightness).toHaveAttribute("tabindex", "0");
        await expect(saturation).toHaveAttribute("tabindex", "-1");
        await page.keyboard.press("ArrowLeft");
        await expectSliderValue(saturation, 50);
        await expect(saturation).toBeFocused();
        const steps: [string, Locator, number][] = [
            ["PageUp", brightness, 61],
            ["PageDown", brightness, 51],
            ["Shift+ArrowRight", saturation, 60],
            ["Shift+ArrowDown", brightness, 41],
            ["Home", saturation, 0],
            ["End", saturation, 100],
        ];
        for (const [key, target, value] of steps) {
            await page.keyboard.press(key);
            await expectSliderValue(target, value);
        }
        await expectOutput(page, "committed", "hsb(210, 100%, 41%)");
    });

    test("a press moves both axes there and focuses the tab stop", async ({
        page,
    }) => {
        await pressIn(page, 0.25, 0.25);
        await expectSliderValue(slider(page, "Saturation"), 25);
        await expectSliderValue(slider(page, "Brightness"), 75);
        await expectOutput(page, "committed", "hsb(210, 25%, 75%)");
        await expect(slider(page, "Saturation")).toBeFocused();
    });

    test("a drag follows the pointer, clamped to the area, and commits on release", async ({
        page,
    }) => {
        const thumb = page.locator('[data-primitives-part="color-area-thumb"]');
        await dragFrom(page, thumb, await pointIn(area(page), 0.8, 0.1));
        await expectSliderValue(slider(page, "Saturation"), 80);
        await expectSliderValue(slider(page, "Brightness"), 90);
        await expectOutput(page, "committed", "none");
        const past = await pointIn(area(page), 1.3, -0.2);
        await page.mouse.move(past.x, past.y, { steps: 4 });
        await expectSliderValue(slider(page, "Saturation"), 100);
        await expectSliderValue(slider(page, "Brightness"), 100);
        await page.mouse.up();
        await expectOutput(page, "committed", "hsb(210, 100%, 100%)");
    });

    test("the form submits both channels", async ({ page }) => {
        await pressIn(page, 0.25, 0.25);
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "saturation=25&brightness=75");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("color-area / rtl", () => {
    test("x runs from the right", async ({ page }) => {
        await openScenario(page, "/color-area/rtl", { dir: "rtl" });
        const saturation = slider(page, "Saturation");
        await saturation.focus();
        await page.keyboard.press("ArrowRight");
        await expectSliderValue(saturation, 49);
        await page.keyboard.press("ArrowLeft");
        await expectSliderValue(saturation, 50);
        await pressIn(page, 0.25, 0.25);
        await expectSliderValue(saturation, 75);
        await expectSliderValue(slider(page, "Brightness"), 75);
    });
});

test.describe("color-area / rgb", () => {
    test("two rgb channels", async ({ page }) => {
        await openScenario(page, "/color-area/rgb");
        const red = slider(page, "Red");
        expect(await sliderState(red)).toEqual({ now: 0, min: 0, max: 255 });
        await expect(red).toHaveAttribute("aria-valuetext", "0");
        await expectSliderValue(slider(page, "Green"), 0);
        await red.focus();
        await page.keyboard.press("End");
        await expectSliderValue(red, 255);
        await page.keyboard.press("PageUp");
        await expectSliderValue(slider(page, "Green"), 17);
    });
});
