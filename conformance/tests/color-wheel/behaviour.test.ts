import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { dragFrom } from "../../src/pointer.ts";
import { openScenario } from "../../src/scenario.ts";
import { expectSliderValue, sliderState } from "../../src/slider.ts";

// spec/color-wheel.md
const thumb = (page: Page) =>
    page.getByRole("slider", { name: "Hue", exact: true });
const wheel = (page: Page) => page.getByTestId("wheel");
const hue = (value: number) => `hsl(${value}, 100%, 50%)`;

/** The page point `dx`, `dy` px from the wheel's top-left corner. */
async function at(page: Page, dx: number, dy: number) {
    const box = await wheel(page).boundingBox();
    expect(box).not.toBeNull();
    const { x, y } = box as NonNullable<typeof box>;
    return { x: Math.round(x + dx), y: Math.round(y + dy) };
}

async function pressAt(page: Page, dx: number, dy: number) {
    const point = await at(page, dx, dy);
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.up();
}

test.describe("color-wheel / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/color-wheel/basic");
    });

    test("one slider with the hue, on the ring's middle circle", async ({
        page,
    }) => {
        expect(await sliderState(thumb(page))).toEqual({
            now: 90,
            min: 0,
            max: 360,
        });
        await expect(thumb(page)).toHaveAttribute("aria-valuetext", "90°");
        const box = await thumb(page).boundingBox();
        const centre = await at(page, 100, 100);
        const { x, y, width, height } = box as NonNullable<typeof box>;
        expect(Math.round(x + width / 2 - centre.x)).toBe(88);
        expect(Math.round(y + height / 2 - centre.y)).toBe(0);
    });

    test("the keys step the hue and wrap around", async ({ page }) => {
        await thumb(page).focus();
        const steps: [string, number][] = [
            ["ArrowRight", 91],
            ["ArrowUp", 92],
            ["ArrowLeft", 91],
            ["ArrowDown", 90],
            ["PageUp", 105],
            ["PageDown", 90],
            ["Shift+ArrowLeft", 75],
            ["Home", 0],
            ["ArrowLeft", 359],
            ["End", 359],
            ["ArrowRight", 0],
        ];
        for (const [key, value] of steps) {
            await page.keyboard.press(key);
            await expectSliderValue(thumb(page), value);
            await expectOutput(page, "value", hue(value));
            await expectOutput(page, "committed", hue(value));
        }
    });

    test("a press on the ring moves the thumb there; off the ring, nothing", async ({
        page,
    }) => {
        await pressAt(page, 100, 100);
        await expectSliderValue(thumb(page), 90);
        await expectOutput(page, "committed", "none");
        await pressAt(page, 100, 188);
        await expectSliderValue(thumb(page), 180);
        await expect(thumb(page)).toBeFocused();
        await expectOutput(page, "committed", hue(180));
    });

    test("a drag follows the pointer's angle and commits on release", async ({
        page,
    }) => {
        await dragFrom(page, thumb(page), await at(page, 12, 100));
        await expectSliderValue(thumb(page), 270);
        await expectOutput(page, "value", hue(270));
        await expectOutput(page, "committed", "none");
        await page.mouse.up();
        await expectOutput(page, "committed", hue(270));
    });

    test("the form submits the color as hex", async ({ page }) => {
        await pressAt(page, 100, 188);
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "color=#00ffff");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("color-wheel / disabled", () => {
    test("neither a press nor the keys change it", async ({ page }) => {
        await openScenario(page, "/color-wheel/disabled");
        await expect(thumb(page)).toHaveAttribute("aria-disabled", "true");
        await expect(thumb(page)).not.toHaveAttribute("tabindex");
        await pressAt(page, 100, 188);
        await expectSliderValue(thumb(page), 200);
        await thumb(page).focus();
        await page.keyboard.press("ArrowRight");
        await expectSliderValue(thumb(page), 200);
    });
});
