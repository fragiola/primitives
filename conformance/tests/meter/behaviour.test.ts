import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/meter.md
const meter = (page: Page, name: string) =>
    page.getByRole("meter", { name, exact: true });

/** The width of a meter's filled part over its rail's: its visible fraction. */
async function filled(page: Page, name: string): Promise<number> {
    return meter(page, name).evaluate((root) => {
        const track = root.querySelector(
            '[data-primitives-part="meter-track"]',
        );
        const indicator = root.querySelector(
            '[data-primitives-part="meter-indicator"]',
        );
        if (track === null || indicator === null) {
            return Number.NaN;
        }
        return (
            indicator.getBoundingClientRect().width /
            track.getBoundingClientRect().width
        );
    });
}

const valueText = (page: Page, name: string) =>
    meter(page, name).locator('[data-primitives-part="meter-value"]');

test.describe("meter / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/meter/basic");
    });

    test("a named meter at 60, written as a percentage", async ({ page }) => {
        const battery = meter(page, "Battery");
        await expect(battery).toHaveAttribute("aria-valuenow", "60");
        await expect(battery).toHaveAttribute("aria-valuemin", "0");
        await expect(battery).toHaveAttribute("aria-valuemax", "100");
        await expect(battery).toHaveAttribute("aria-valuetext", "60%");
        await expect(valueText(page, "Battery")).toHaveText("60%");
        expect(await filled(page, "Battery")).toBeCloseTo(0.6, 2);
        await expectOutput(page, "value", "60");
    });

    test("a format writes the value itself; the indicator fills its share", async ({
        page,
    }) => {
        const storage = meter(page, "Storage");
        await expect(storage).toHaveAttribute("aria-valuenow", "384");
        await expect(storage).toHaveAttribute("aria-valuemax", "512");
        await expect(storage).toHaveAttribute("aria-valuetext", "384 GB");
        await expect(valueText(page, "Storage")).toHaveText("384 GB");
        expect(await filled(page, "Storage")).toBeCloseTo(0.75, 2);
    });

    test("a new value, and one past max clamped", async ({ page }) => {
        await page.getByRole("button", { name: "Drain" }).click();
        const battery = meter(page, "Battery");
        await expect(battery).toHaveAttribute("aria-valuenow", "10");
        await expect(battery).toHaveAttribute("aria-valuetext", "10%");
        await page.getByRole("button", { name: "Overcharge" }).click();
        await expectOutput(page, "value", "140");
        await expect(battery).toHaveAttribute("aria-valuenow", "100");
        await expect(battery).toHaveAttribute("aria-valuetext", "100%");
        await expect.poll(() => filled(page, "Battery")).toBeCloseTo(1, 2);
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test("meter / basic?dir=rtl: the indicator starts at the track's right edge", async ({
    page,
}) => {
    await openScenario(page, "/meter/basic", { dir: "rtl" });
    const edges = await meter(page, "Storage").evaluate((root) => {
        const track = root
            .querySelector('[data-primitives-part="meter-track"]')
            ?.getBoundingClientRect();
        const indicator = root
            .querySelector('[data-primitives-part="meter-indicator"]')
            ?.getBoundingClientRect();
        return {
            track: track?.right ?? 0,
            indicator: indicator?.right ?? Number.NaN,
            left: (indicator?.left ?? 0) - (track?.left ?? 0),
        };
    });
    expect(edges.indicator).toBeCloseTo(edges.track, 0);
    expect(edges.left).toBeGreaterThan(10);
    await expectNoAxeViolations(page);
});
