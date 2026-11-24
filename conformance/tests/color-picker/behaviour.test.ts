import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted, resetForm } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";
import { stubEyeDropper } from "./eye-dropper.ts";

// spec/color-picker.md
const slider = (page: Page, name: string) =>
    page.getByRole("slider", { name, exact: true });

/** A slider's value: its `aria-valuenow`, or a ColorArea's native range input's value. */
async function expectValueNow(
    page: Page,
    name: string,
    value: number,
): Promise<void> {
    const control = slider(page, name);
    if (name === "Saturation" || name === "Brightness") {
        await expect(control).toHaveValue(String(value));
        return;
    }
    await expect(control).toHaveAttribute("aria-valuenow", String(value));
}

test.describe("color-picker / basic", () => {
    test.beforeEach(async ({ page }) => {
        await stubEyeDropper(page, "#336699");
        await openScenario(page, "/color-picker/basic");
    });

    test("one color shown by every bound control, the own slider apart", async ({
        page,
    }) => {
        const group = page.getByRole("group", { name: "Theme color" });
        await expect(group).toHaveAttribute("data-format", "hex");
        await expectValueNow(page, "Hue", 210);
        await expectValueNow(page, "Saturation", 50);
        await expectValueNow(page, "Brightness", 60);
        await expectValueNow(page, "Opacity", 1);
        await expectValueNow(page, "Own hue", 0);
        await expect(page.getByRole("textbox", { name: "Hex" })).toHaveValue(
            "#4d7399",
        );
        await expect(
            page.getByRole("img", { name: "Current color" }),
        ).toBeVisible();
        await expect(
            page
                .getByRole("listbox", { name: "Presets" })
                .getByRole("option", { selected: true }),
        ).toHaveCount(0);
        await expect(
            page.getByRole("combobox", { name: "Format" }),
        ).toHaveValue("hex");
    });

    test("a bound control's change is every control's; the own slider keeps its own", async ({
        page,
    }) => {
        await slider(page, "Hue").focus();
        await page.keyboard.press("ArrowRight");
        await expectOutput(page, "value", "#4d7199");
        await expectOutput(page, "space", "hsb");
        await expectOutput(page, "committed", "#4d7199");
        await expect(page.getByRole("textbox", { name: "Hex" })).toHaveValue(
            "#4d7199",
        );
        await expectValueNow(page, "Own hue", 0);

        await slider(page, "Own hue").focus();
        await page.keyboard.press("ArrowRight");
        await expectOutput(page, "own", "hsl(1, 100%, 50%)");
        await expectValueNow(page, "Own hue", 1);
        await expectOutput(page, "value", "#4d7199");
        await expectValueNow(page, "Hue", 211);
    });

    test("the hex field, the presets, the opacity", async ({ page }) => {
        const hex = page.getByRole("textbox", { name: "Hex" });
        await hex.fill("#ff0000");
        await hex.press("Enter");
        await expectOutput(page, "value", "#ff0000");
        await expectOutput(page, "space", "rgb");
        await expectOutput(page, "committed", "#ff0000");
        await expectValueNow(page, "Hue", 0);
        await expectValueNow(page, "Saturation", 100);
        await expectValueNow(page, "Brightness", 100);
        await expect(
            page.getByRole("option", { name: "Red", exact: true }),
        ).toHaveAttribute("aria-selected", "true");

        await page.getByRole("option", { name: "Green", exact: true }).click();
        await expectOutput(page, "value", "#00ff00");
        await expectOutput(page, "committed", "#00ff00");
        await expect(
            page.getByRole("option", { name: "Green", exact: true }),
        ).toHaveAttribute("aria-selected", "true");
        await expect(
            page.getByRole("option", { name: "Red", exact: true }),
        ).toHaveAttribute("aria-selected", "false");
        await expectValueNow(page, "Hue", 120);

        await slider(page, "Opacity").focus();
        await page.keyboard.press("Home");
        await expectOutput(page, "value", "#00ff0000");
        await page.keyboard.press("End");
        await expectOutput(page, "value", "#00ff00");
    });

    test("a reset with nothing changed shows the color again in every control", async ({
        page,
    }) => {
        await resetForm(page);
        await page.evaluate(() => new Promise((done) => setTimeout(done, 50)));
        await expectValueNow(page, "Saturation", 50);
        await expectValueNow(page, "Brightness", 60);
        await expectValueNow(page, "Hue", 210);
        await expect(page.getByRole("textbox", { name: "Hex" })).toHaveValue(
            "#4d7399",
        );
    });

    test("the format, the form value and a reset", async ({ page }) => {
        await page.getByRole("option", { name: "Green", exact: true }).click();
        await page
            .getByRole("combobox", { name: "Format" })
            .selectOption("hsl");
        await expectOutput(page, "format", "hsl");
        await expectOutput(page, "space", "hsl");
        await expectOutput(page, "value", "#00ff00");
        await expect(
            page.getByRole("group", { name: "Theme color" }),
        ).toHaveAttribute("data-format", "hsl");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "color=#00ff00");

        await slider(page, "Own hue").focus();
        await page.keyboard.press("ArrowRight");
        await resetForm(page);
        await expectValueNow(page, "Hue", 210);
        await expect(page.getByRole("textbox", { name: "Hex" })).toHaveValue(
            "#4d7399",
        );
        await expectOutput(page, "value", "#4d7399");
        await expectValueNow(page, "Own hue", 0);
        await expectValueNow(page, "Saturation", 50);
        await expectValueNow(page, "Brightness", 60);
        await expect(
            page.getByRole("combobox", { name: "Format" }),
        ).toHaveValue("hsl");
    });

    test("the eyedropper picks in the value's space, keeping its alpha", async ({
        page,
    }) => {
        await page.getByRole("button", { name: "Pick a color" }).click();
        await expectOutput(page, "value", "#336699");
        await expectOutput(page, "space", "hsb");
        await expectOutput(page, "committed", "#336699");

        await slider(page, "Opacity").focus();
        await page.keyboard.press("Home");
        await page.keyboard.press("PageUp");
        await page.keyboard.press("PageUp");
        await page.keyboard.press("PageUp");
        await page.keyboard.press("PageUp");
        await page.keyboard.press("PageUp");
        await expectValueNow(page, "Opacity", 0.5);
        await page.getByRole("button", { name: "Pick a color" }).click();
        await expectOutput(page, "value", "#33669980");
    });

    test("axe finds no violation", async ({ page }) => {
        await expect(
            page.getByRole("button", { name: "Pick a color" }),
        ).toBeVisible();
        await expectNoAxeViolations(page);
    });
});

test("color-picker / basic: no eyedropper without the API; a cancelled pick changes nothing", async ({
    page,
}) => {
    await stubEyeDropper(page, null);
    await openScenario(page, "/color-picker/basic");
    await expectValueNow(page, "Hue", 210);
    await expect(
        page.getByRole("button", { name: "Pick a color" }),
    ).toHaveCount(0);
});

test("color-picker / basic: a cancelled pick changes nothing", async ({
    page,
}) => {
    await stubEyeDropper(page, "cancel");
    await openScenario(page, "/color-picker/basic");
    await page.getByRole("button", { name: "Pick a color" }).click();
    // the stub's rejection has been seen, and the tasks after it ran
    await page.waitForFunction(() => "eyeDropperOpened" in window);
    await page.evaluate(() => new Promise((done) => setTimeout(done, 50)));
    await expectOutput(page, "value", "none");
    await expectOutput(page, "committed", "none");
});

test.describe("color-picker / popover", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/color-picker/popover");
    });

    const trigger = (page: Page) =>
        page.getByRole("button", { name: "Accent color", exact: true });
    const dialog = (page: Page) =>
        page.getByRole("dialog", { name: "Accent color picker" });

    test("the trigger opens the non-modal dialog, focusing its first control; Escape closes it", async ({
        page,
    }) => {
        await expect(trigger(page)).toHaveAttribute("aria-haspopup", "dialog");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
        await expect(dialog(page)).toHaveCount(0);
        await trigger(page).click();
        await expect(dialog(page)).toBeVisible();
        await expectOutput(page, "open", "true");
        await expectOutput(page, "reason", "trigger-press");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
        await expect(slider(page, "Saturation")).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expectOutput(page, "value", "#316599");
        await page.keyboard.press("Escape");
        await expect(dialog(page)).toHaveCount(0);
        await expectOutput(page, "reason", "escape-key");
        await expect(trigger(page)).toBeFocused();
    });

    test("Tab moves through the popup, then out of it, closing it", async ({
        page,
    }) => {
        await trigger(page).focus();
        await page.keyboard.press("Enter");
        await expect(slider(page, "Saturation")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(slider(page, "Hue")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(page.getByRole("textbox", { name: "Hex" })).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(dialog(page)).toHaveCount(0);
        await expectOutput(page, "reason", "focus-out");
        await expect(page.getByRole("button", { name: "After" })).toBeFocused();
    });

    test("an outside press closes it; the form has the value while it is closed", async ({
        page,
    }) => {
        await trigger(page).click();
        await page.keyboard.press("ArrowRight");
        await page.mouse.click(600, 500);
        await expect(dialog(page)).toHaveCount(0);
        await expectOutput(page, "reason", "outside-press");
        await expect(trigger(page)).toBeFocused();
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "accent=#316599");
    });

    test("axe finds no violation while it is open", async ({ page }) => {
        await trigger(page).click();
        await expect(dialog(page)).toBeVisible();
        await expectNoAxeViolations(page);
    });
});

test("color-picker / field: the Field names and describes the group; the bound slider submits nothing", async ({
    page,
}) => {
    await openScenario(page, "/color-picker/field");
    const group = page.getByRole("group", { name: "Brand color" });
    await expect(group).toHaveAccessibleDescription("Used for links.");
    await expect(slider(page, "Hue")).toBeVisible();

    // focus in the popup is focus in the picker: no blur until it leaves both
    const more = page.getByRole("button", { name: "More options" });
    const hex = page.getByRole("textbox", { name: "Hex" });
    await more.click();
    await expect(hex).toBeFocused();
    await expect(group).toHaveAttribute("data-focused", "");
    await expect(group).not.toHaveAttribute("data-touched");
    await page.keyboard.press("Escape");
    await expect(more).toBeFocused();
    await expect(group).not.toHaveAttribute("data-touched");
    await page.keyboard.press("Enter");
    await expect(hex).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(group).toHaveAttribute("data-touched", "");
    await expect(group).not.toHaveAttribute("data-focused");

    await page.getByRole("button", { name: "Submit" }).click();
    await expectSubmitted(page, "brand=#336699");
    await slider(page, "Hue").focus();
    await page.keyboard.press("ArrowRight");
    await expectOutput(page, "value", "#336499");
    await page.getByRole("button", { name: "Submit" }).click();
    await expectSubmitted(page, "brand=#336499");
});

test("color-picker / disabled: every control inside is disabled", async ({
    page,
}) => {
    await stubEyeDropper(page, "#336699");
    await openScenario(page, "/color-picker/disabled");
    await expect(slider(page, "Hue")).toHaveAttribute("aria-disabled", "true");
    await expect(slider(page, "Hue")).not.toHaveAttribute("tabindex");
    await expect(
        page.getByRole("listbox", { name: "Presets" }),
    ).toHaveAttribute("aria-disabled", "true");
    await expect(page.getByRole("combobox", { name: "Format" })).toBeDisabled();
    await expect(
        page.getByRole("button", { name: "Pick a color" }),
    ).toBeDisabled();
    const open = page.getByRole("button", { name: "Open picker" });
    await expect(open).toBeDisabled();
    await open.click({ force: true });
    await expect(page.getByRole("dialog")).toHaveCount(0);
});
