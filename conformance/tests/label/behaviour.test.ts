import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/label.md
const selection = (page: Page) =>
    page.evaluate(() => document.getSelection()?.toString() ?? "");

test.describe("label / controls", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/label/controls");
    });

    test("names every kind of control", async ({ page }) => {
        await expect(
            page.getByRole("textbox", { name: "Email", exact: true }),
        ).toBeVisible();
        await expect(
            page.getByRole("checkbox", { name: "Subscribe", exact: true }),
        ).toBeVisible();
        await expect(
            page.getByRole("switch", { name: "Notifications", exact: true }),
        ).toBeVisible();
        await expect(
            page.getByRole("spinbutton", { name: "Quantity", exact: true }),
        ).toBeVisible();
        await expect(
            page.getByRole("slider", { name: "Volume", exact: true }),
        ).toBeVisible();
        await expect(
            page.locator('[data-primitives-part="label-root"]'),
        ).toHaveCount(5);
    });

    test("a press focuses a text input and a number field's input", async ({
        page,
    }) => {
        await page.getByText("Email", { exact: true }).click();
        await expect(
            page.getByRole("textbox", { name: "Email" }),
        ).toBeFocused();
        await page.getByText("Quantity", { exact: true }).click();
        await expect(
            page.getByRole("spinbutton", { name: "Quantity" }),
        ).toBeFocused();
    });

    test("a press toggles a checkbox it wraps and a switch it names", async ({
        page,
    }) => {
        await page.getByText("Subscribe", { exact: true }).click();
        await expectOutput(page, "subscribe", "true");
        await expect(
            page.getByRole("checkbox", { name: "Subscribe" }),
        ).toBeChecked();
        await page.getByText("Notifications", { exact: true }).click();
        await expectOutput(page, "notifications", "true");
        await expect(
            page.getByRole("switch", { name: "Notifications" }),
        ).toHaveAttribute("aria-checked", "true");
    });

    test("a press focuses an element `for` names that is no labelable one", async ({
        page,
    }) => {
        await page.getByText("Volume", { exact: true }).click();
        await expect(
            page.getByRole("slider", { name: "Volume" }),
        ).toBeFocused();
    });

    test("a double press selects none of its text", async ({ page }) => {
        await page.getByText("Email", { exact: true }).dblclick();
        expect(await selection(page)).toBe("");
        await page.getByText("Volume", { exact: true }).dblclick();
        expect(await selection(page)).toBe("");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});
