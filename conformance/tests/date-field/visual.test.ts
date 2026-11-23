import { expect, type Page, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { typeKeys } from "../../src/segments.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

/** Types into the first segment, then leaves the field. */
async function fill(page: Page, keys: string): Promise<void> {
    await page.getByRole("spinbutton").first().focus();
    await typeKeys(page, keys);
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
}

test("date-field / basic: empty", async ({ page }) => {
    await openScenario(page, "/date-field/basic", { today: true });
    await expect(page.getByRole("spinbutton")).toHaveCount(3);
    await expectScreen(page, "date-field-basic-empty");
});

test("date-field / basic: filled", async ({ page }) => {
    await openScenario(page, "/date-field/basic", { today: true });
    await fill(page, "11232026");
    await expect(page.getByTestId("output")).toContainText("2026-11-23");
    await expectScreen(page, "date-field-basic");
});

test("date-field / basic?locale=he-IL&dir=rtl", async ({ page }) => {
    await openScenario(page, "/date-field/basic", {
        today: true,
        locale: "he-IL",
        dir: "rtl",
    });
    await fill(page, "2311");
    await expectScreen(page, "date-field-basic-he-rtl");
});

test("date-field / basic?locale=ar-EG&dir=rtl", async ({ page }) => {
    await openScenario(page, "/date-field/basic", {
        today: true,
        locale: "ar-EG",
        dir: "rtl",
    });
    await fill(page, "23112026");
    await expect(page.getByTestId("output")).toContainText("2026-11-23");
    await expectScreen(page, "date-field-basic-ar-rtl");
});

test("date-field / min-max: invalid", async ({ page }) => {
    await openScenario(page, "/date-field/min-max", { today: true });
    await fill(page, "11092026");
    await expect(
        page.locator('[data-primitives-part="date-field-root"]'),
    ).toHaveAttribute("data-invalid", "");
    await expectScreen(page, "date-field-min-max-invalid");
});

test("date-field / date-time", async ({ page }) => {
    await openScenario(page, "/date-field/date-time", { today: true });
    await fill(page, "1123202623");
    await expectScreen(page, "date-field-date-time");
});
