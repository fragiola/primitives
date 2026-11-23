import { expect, type Locator, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/aspect-ratio.md
async function size(locator: Locator) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    const { width, height } = box as NonNullable<typeof box>;
    return { width: Math.round(width), height: Math.round(height) };
}

/** The AspectRatio around a named element. */
const frameOf = (inner: Locator) =>
    inner.locator(
        'xpath=ancestor::*[@data-primitives-part="aspect-ratio-root"]',
    );

test.describe("aspect ratio / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/aspect-ratio/basic");
    });

    test("keeps 16:9 and 1:1, its content filling it", async ({ page }) => {
        const image = page.getByRole("img", { name: "Mountain lake" });
        expect(await size(frameOf(image))).toEqual({ width: 320, height: 180 });
        expect(await size(image)).toEqual({ width: 320, height: 180 });
        const square = page.getByRole("img", { name: "Avatar placeholder" });
        expect(await size(frameOf(square))).toEqual({
            width: 160,
            height: 160,
        });
    });

    test("its height follows its width", async ({ page }) => {
        const image = page.getByRole("img", { name: "Mountain lake" });
        await page.getByRole("button", { name: "Widen" }).click();
        await expect
            .poll(() => size(frameOf(image)))
            .toEqual({ width: 512, height: 288 });
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});
