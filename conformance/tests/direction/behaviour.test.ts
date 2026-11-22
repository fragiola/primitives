import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { fullDate } from "../../src/dates.ts";
import { expectFocusWithin } from "../../src/focus.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";
import { expectSliderValue } from "../../src/slider.ts";

// spec/direction.md: a DirectionProvider `rtl` in a document with no `dir`; the keys, and the
// submenu's logical side, follow the provider, not the computed direction.
const cell = (page: Page, day: number) =>
    page.getByRole("gridcell", {
        name: fullDate("en-US", 2026, 11, day),
        exact: true,
    });
const item = (page: Page, name: string) =>
    page.getByRole("menuitem", { name, exact: true });

test.describe("direction / provider", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/direction/provider", { today: true });
    });

    test("the provider's direction is read inside it; the document has none", async ({
        page,
    }) => {
        await expectOutput(page, "direction", "rtl");
        await expect(page.locator("html")).not.toHaveAttribute("dir");
        expect(
            await page.evaluate(
                () => getComputedStyle(document.body).direction,
            ),
        ).toBe("ltr");
    });

    test("Tabs: ArrowLeft moves to the next tab", async ({ page }) => {
        const tab = (name: string) =>
            page.getByRole("tab", { name, exact: true });
        await tab("Account").focus();
        await page.keyboard.press("ArrowLeft");
        await expect(tab("Password")).toBeFocused();
        await expect(tab("Password")).toHaveAttribute("aria-selected", "true");
        await page.keyboard.press("ArrowRight");
        await expect(tab("Account")).toBeFocused();
    });

    test("Slider: ArrowRight decreases", async ({ page }) => {
        const volume = page.getByRole("slider", {
            name: "Volume",
            exact: true,
        });
        await volume.focus();
        await page.keyboard.press("ArrowRight");
        await expectSliderValue(volume, 49);
        await page.keyboard.press("ArrowLeft");
        await expectSliderValue(volume, 50);
    });

    test("Menu: ArrowLeft opens the submenu, on the left; ArrowRight closes it", async ({
        page,
    }) => {
        await page.getByRole("button", { name: "File", exact: true }).focus();
        await page.keyboard.press("ArrowDown");
        await expect(item(page, "New file")).toBeFocused();
        await page.keyboard.press("ArrowDown");
        await expect(item(page, "Share")).toBeFocused();
        await page.keyboard.press("ArrowLeft");
        await expect(item(page, "Email")).toBeFocused();
        const share = await item(page, "Share").boundingBox();
        const sub = await page
            .getByRole("menu", { name: "Share" })
            .boundingBox();
        if (share === null || sub === null) {
            throw new Error("missing boxes");
        }
        expect(sub.x + sub.width).toBeLessThanOrEqual(share.x + 2);
        await page.keyboard.press("ArrowRight");
        await expect(page.getByRole("menu", { name: "Share" })).toBeHidden();
        await expect(item(page, "Share")).toBeFocused();
    });

    test("Calendar: ArrowRight goes to the previous day", async ({ page }) => {
        await cell(page, 20).focus();
        await page.keyboard.press("ArrowRight");
        await expectFocusWithin(cell(page, 19));
        await page.keyboard.press("ArrowLeft");
        await expectFocusWithin(cell(page, 20));
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});
