import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted, resetForm } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/color-swatch-picker.md
const option = (page: Page, name: string) =>
    page.getByRole("option", { name, exact: true });

/** Exactly this option is selected (or none). */
async function expectSelected(page: Page, name: string | null): Promise<void> {
    const selected = page.getByRole("option", { selected: true });
    if (name === null) {
        await expect(selected).toHaveCount(0);
        return;
    }
    await expect(selected).toHaveCount(1);
    await expect(selected).toHaveAccessibleName(name);
}

test.describe("color-swatch-picker / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/color-swatch-picker/basic");
    });

    test("a named, horizontal listbox of eight options named by their swatches", async ({
        page,
    }) => {
        const list = page.getByRole("listbox", { name: "Palette" });
        await expect(list).toHaveAttribute("aria-orientation", "horizontal");
        await expect(page.getByRole("option")).toHaveCount(8);
        await expectSelected(page, null);
        await expect(option(page, "Gray")).toHaveAttribute(
            "aria-disabled",
            "true",
        );
    });

    test("Tab enters at the first option; ArrowRight moves the focus, not the selection", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await expect(option(page, "Red")).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(option(page, "Orange")).toBeFocused();
        await expect(option(page, "Orange")).toHaveAttribute(
            "data-highlighted",
            "",
        );
        await expectOutput(page, "value", "none");
        await expectSelected(page, null);
    });

    test("Space and Enter select; ArrowDown and ArrowUp move between the rows", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Space");
        await expectOutput(page, "value", "#ff8000");
        await expectOutput(page, "reason", "keyboard");
        await expectSelected(page, "Orange");
        await expect(option(page, "Orange")).toHaveAttribute(
            "data-selected",
            "",
        );
        await page.keyboard.press("ArrowDown");
        await expect(option(page, "Blue")).toBeFocused();
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "#0000ff");
        await expectSelected(page, "Blue");
        await page.keyboard.press("ArrowUp");
        await expect(option(page, "Orange")).toBeFocused();
        await page.keyboard.press("ArrowUp");
        await expect(option(page, "Orange")).toBeFocused();
    });

    test("End, Home, the wrap along the row, a disabled option is never selected", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Space");
        await expectOutput(page, "value", "#00ffff");
        await page.keyboard.press("End");
        await expect(option(page, "Gray")).toBeFocused();
        await page.keyboard.press("ArrowDown");
        await expect(option(page, "Gray")).toBeFocused();
        await page.keyboard.press("Space");
        await expectOutput(page, "value", "#00ffff");
        await page.keyboard.press("ArrowRight");
        await expect(option(page, "Red")).toBeFocused();
        await page.keyboard.press("ArrowLeft");
        await expect(option(page, "Gray")).toBeFocused();
        await page.keyboard.press("Home");
        await expect(option(page, "Red")).toBeFocused();
    });

    test("Tab leaves; Shift+Tab comes back to the selected option", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Space");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("Tab");
        await expect(
            page.getByRole("button", { name: "Submit" }),
        ).toBeFocused();
        await page.keyboard.press("Shift+Tab");
        await expect(option(page, "Blue")).toBeFocused();
    });

    test("a click selects; a disabled option takes focus only; the form submits the hex", async ({
        page,
    }) => {
        await option(page, "Yellow").click();
        await expect(option(page, "Yellow")).toBeFocused();
        await expectOutput(page, "value", "#ffff00");
        await expectOutput(page, "reason", "item-press");
        await option(page, "Gray").click({ force: true });
        await expect(option(page, "Gray")).toBeFocused();
        await expectSelected(page, "Yellow");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "color=#ffff00");
    });

    test("axe finds no violation", async ({ page }) => {
        await page.keyboard.press("Tab");
        await page.keyboard.press("Space");
        await expectNoAxeViolations(page);
    });
});

test("color-swatch-picker / rtl: ArrowLeft is next, the rows run from the right", async ({
    page,
}) => {
    await openScenario(page, "/color-swatch-picker/rtl", { dir: "rtl" });
    await page.keyboard.press("Tab");
    await expect(option(page, "Red")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(option(page, "Orange")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(option(page, "Red")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(option(page, "Cyan")).toBeFocused();
});

test("color-swatch-picker / field: named and described by the Field, submitted and reset", async ({
    page,
}) => {
    await openScenario(page, "/color-swatch-picker/field");
    const list = page.getByRole("listbox", { name: "Accent" });
    await expect(list).toHaveAccessibleDescription("The links' color.");
    await expectSelected(page, "Green");
    await page.getByRole("button", { name: "Submit" }).click();
    await expectSubmitted(page, "accent=#00ff00");
    await option(page, "Blue").click();
    await expectOutput(page, "value", "#0000ff");
    await page.getByRole("button", { name: "Submit" }).click();
    await expectSubmitted(page, "accent=#0000ff");
    await resetForm(page);
    await expectSelected(page, "Green");
    await expectOutput(page, "value", "#00ff00");
});
