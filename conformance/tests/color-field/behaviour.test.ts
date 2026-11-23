import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/color-field.md
const submit = (page: Page) => page.getByRole("button", { name: "Submit" });

test.describe("color-field / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/color-field/basic");
    });

    test("a textbox with the value as hex", async ({ page }) => {
        await expect(page.getByRole("textbox", { name: "Color" })).toHaveValue(
            "#336699",
        );
    });

    test("typing commits on Enter and on blur, a wrong text goes back", async ({
        page,
    }) => {
        const field = page.getByRole("textbox", { name: "Color" });
        await field.fill("f00");
        await expectOutput(page, "value", "none");
        await field.press("Enter");
        await expect(field).toHaveValue("#ff0000");
        await expectOutput(page, "value", "#ff0000");
        await field.fill("nonsense");
        await field.press("Tab");
        await expect(field).toHaveValue("#ff0000");
        await expectOutput(page, "value", "#ff0000");
        await field.fill("rgb(0, 0, 255)");
        await field.press("Tab");
        await expect(field).toHaveValue("#0000ff");
        await expectOutput(page, "value", "#0000ff");
    });

    test("the arrows step the hex number", async ({ page }) => {
        const field = page.getByRole("textbox", { name: "Color" });
        await field.fill("#0000ff");
        await field.press("Enter");
        await field.press("ArrowUp");
        await expect(field).toHaveValue("#000100");
        await expectOutput(page, "value", "#000100");
        await field.press("ArrowDown");
        await expect(field).toHaveValue("#0000ff");
    });

    test("the form submits the hex, and nothing once emptied", async ({
        page,
    }) => {
        const field = page.getByRole("textbox", { name: "Color" });
        await submit(page).click();
        await expectSubmitted(page, "color=#336699");
        await field.fill("");
        await field.press("Tab");
        await expectOutput(page, "value", "none");
        await expect(field).toHaveValue("");
        await submit(page).click();
        await expectSubmitted(page, "color=");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("color-field / channel", () => {
    test("a spinbutton for one channel", async ({ page }) => {
        await openScenario(page, "/color-field/channel");
        const field = page.getByRole("spinbutton", { name: "Hue" });
        await expect(field).toHaveAttribute("aria-valuenow", "120");
        await expect(field).toHaveAttribute("aria-valuemin", "0");
        await expect(field).toHaveAttribute("aria-valuemax", "360");
        await expect(field).toHaveAttribute("aria-valuetext", "120°");
        await expect(field).toHaveValue("120°");
        await field.focus();
        const steps: [string, number][] = [
            ["ArrowUp", 121],
            ["PageUp", 136],
            ["PageDown", 121],
            ["Home", 0],
            ["End", 360],
        ];
        for (const [key, value] of steps) {
            await page.keyboard.press(key);
            await expect(field).toHaveAttribute("aria-valuenow", String(value));
            await expect(field).toHaveValue(`${value}°`);
        }
        await expectOutput(page, "value", "hsl(360, 50%, 50%)");
        await field.fill("200");
        await field.press("Enter");
        await expect(field).toHaveValue("200°");
        await expectOutput(page, "value", "hsl(200, 50%, 50%)");
        await submit(page).click();
        await expectSubmitted(page, "hue=200");
        await field.fill("400");
        await field.press("Tab");
        await expect(field).toHaveValue("360°");
        await field.fill("abc");
        await field.press("Tab");
        await expect(field).toHaveValue("360°");
    });
});

test.describe("color-field / field", () => {
    test("named and described by its Field, submitted under its name", async ({
        page,
    }) => {
        await openScenario(page, "/color-field/field");
        const field = page.getByRole("textbox", { name: "Brand color" });
        await expect(field).toHaveAccessibleDescription("A hex color.");
        await submit(page).click();
        await expectSubmitted(page, "brand=#ff0000");
    });
});
