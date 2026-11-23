import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/toolbar.md
const button = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true });

/** An item of the toolbar, whatever its role. */
function item(page: Page, name: string): Locator {
    if (name === "Help") {
        return page.getByRole("link", { name });
    }
    if (name === "Search") {
        return page.getByRole("textbox", { name });
    }
    return button(page, name);
}

/** Presses `key` and expects the focus on `name`. */
async function step(page: Page, key: string, name: string): Promise<void> {
    await page.keyboard.press(key);
    await expect(item(page, name)).toBeFocused();
}

/** The Search input's selection, as `[start, end]`. */
async function expectSelection(
    page: Page,
    start: number,
    end: number,
): Promise<void> {
    await expect
        .poll(() =>
            item(page, "Search").evaluate((input: HTMLInputElement) => [
                input.selectionStart,
                input.selectionEnd,
            ]),
        )
        .toEqual([start, end]);
}

test.describe("toolbar / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/toolbar/basic");
    });

    test("a named horizontal toolbar with its groups, separators and items", async ({
        page,
    }) => {
        const toolbar = page.getByRole("toolbar", { name: "Formatting" });
        await expect(toolbar).toHaveAttribute("aria-orientation", "horizontal");
        await expect(
            toolbar.getByRole("group", { name: "Text style" }),
        ).toBeVisible();
        await expect(
            toolbar.getByRole("group", { name: "History" }),
        ).toBeVisible();
        const separators = toolbar.getByRole("separator");
        await expect(separators).toHaveCount(2);
        for (const separator of await separators.all()) {
            await expect(separator).toHaveAttribute(
                "aria-orientation",
                "vertical",
            );
        }
        await expect(button(page, "Redo")).toBeDisabled();
        await expect(button(page, "Share")).toHaveAttribute(
            "aria-disabled",
            "true",
        );
        await expect(item(page, "Help")).toBeVisible();
        await expect(item(page, "Search")).toHaveValue("draft");
    });

    test("one tab stop for the whole toolbar, the ToggleGroup inside it included", async ({
        page,
    }) => {
        await button(page, "Before").focus();
        await step(page, "Tab", "Bold");
        await step(page, "Tab", "After");
        await step(page, "Shift+Tab", "Bold");
        await expect(
            page
                .getByRole("toolbar", { name: "Formatting" })
                .locator('[tabindex="0"]'),
        ).toHaveCount(1);
    });

    test("ArrowRight moves through every item, the disabled one skipped, the focusable disabled one reached", async ({
        page,
    }) => {
        await button(page, "Bold").focus();
        await step(page, "ArrowRight", "Italic");
        await step(page, "ArrowRight", "Undo");
        await step(page, "ArrowRight", "Share");
        await step(page, "ArrowRight", "Help");
        await step(page, "ArrowRight", "Search");
        // the toolbar's keys select an Input's whole text
        await expectSelection(page, 0, 5);
    });

    test("the Input keeps its caret keys until the caret is at the edge", async ({
        page,
    }) => {
        await item(page, "Search").focus();
        await item(page, "Search").evaluate((input: HTMLInputElement) =>
            input.select(),
        );
        await step(page, "ArrowRight", "Search");
        await expectSelection(page, 5, 5);
        await step(page, "ArrowRight", "Bold");
        await step(page, "ArrowLeft", "Search");
        await expectSelection(page, 0, 5);
        await step(page, "ArrowLeft", "Search");
        await expectSelection(page, 0, 0);
        await step(page, "ArrowLeft", "Help");
    });

    test("Home and End go to the ends; in the Input they move its caret", async ({
        page,
    }) => {
        await button(page, "Undo").focus();
        await step(page, "Home", "Bold");
        await step(page, "End", "Search");
        // the caret inside the text: ArrowRight collapses the selection, ArrowLeft moves back
        await step(page, "ArrowRight", "Search");
        await step(page, "ArrowLeft", "Search");
        await expectSelection(page, 4, 4);
        await step(page, "Home", "Search");
        await expectSelection(page, 0, 0);
        await step(page, "End", "Search");
        await expectSelection(page, 5, 5);
        await button(page, "Bold").focus();
        await step(page, "ArrowDown", "Bold");
        await step(page, "ArrowUp", "Bold");
    });

    test("the item that last had focus keeps the tab stop", async ({
        page,
    }) => {
        await button(page, "Bold").focus();
        await step(page, "ArrowRight", "Italic");
        await step(page, "ArrowRight", "Undo");
        await step(page, "Tab", "After");
        await step(page, "Shift+Tab", "Undo");
    });

    test("the items act: the toggles, a button, and the focusable disabled button that does nothing", async ({
        page,
    }) => {
        await button(page, "Bold").focus();
        await page.keyboard.press("Space");
        await expectOutput(page, "style", "bold");
        await button(page, "Italic").click();
        await expectOutput(page, "style", "bold,italic");
        await button(page, "Undo").click();
        await expectOutput(page, "pressed", "Undo");
        // forced: Playwright waits for an aria-disabled element to be enabled
        await button(page, "Share").click({ force: true });
        await button(page, "Share").focus();
        await page.keyboard.press("Enter");
        await page.keyboard.press("Space");
        await expectOutput(page, "pressed", "Undo");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("toolbar / basic, right to left", () => {
    test("ArrowLeft is the next item; Home and End do not change", async ({
        page,
    }) => {
        await openScenario(page, "/toolbar/basic", { dir: "rtl" });
        await button(page, "Bold").focus();
        await step(page, "ArrowLeft", "Italic");
        await step(page, "ArrowRight", "Bold");
        await step(page, "ArrowRight", "Search");
        await button(page, "Italic").focus();
        await step(page, "Home", "Bold");
        await step(page, "End", "Search");
    });
});

test.describe("toolbar / vertical", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/toolbar/vertical");
    });

    test("a vertical toolbar, its separator across it, the nested group in its orientation", async ({
        page,
    }) => {
        const toolbar = page.getByRole("toolbar", { name: "Tools" });
        await expect(toolbar).toHaveAttribute("aria-orientation", "vertical");
        await expect(toolbar.getByRole("separator")).toHaveAttribute(
            "aria-orientation",
            "horizontal",
        );
        await expect(page.getByRole("group", { name: "Zoom" })).toHaveAttribute(
            "data-orientation",
            "vertical",
        );
    });

    test("a Toggle and a ToggleGroup inside add no tab stop", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await expect(button(page, "Select")).toBeFocused();
        await step(page, "Tab", "After");
    });

    test("the vertical arrows move through every item, without loop; the horizontal ones do nothing", async ({
        page,
    }) => {
        await button(page, "Select").focus();
        await step(page, "ArrowDown", "Draw");
        await step(page, "ArrowDown", "Snap");
        await step(page, "ArrowDown", "Fit");
        await step(page, "ArrowDown", "Fill");
        await step(page, "ArrowDown", "Fill");
        await step(page, "ArrowUp", "Fit");
        await step(page, "ArrowRight", "Fit");
        await step(page, "ArrowLeft", "Fit");
        await step(page, "Home", "Select");
        await step(page, "End", "Fill");
    });

    test("the Toggle and the group's toggles act", async ({ page }) => {
        await button(page, "Snap").focus();
        await page.keyboard.press("Space");
        await expectOutput(page, "snap", "true");
        await button(page, "Fit").focus();
        await page.keyboard.press("Enter");
        await expectOutput(page, "zoom", "fit");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("toolbar / overlay", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/toolbar/overlay");
    });

    test("one tab stop with the popover closed", async ({ page }) => {
        await page.keyboard.press("Tab");
        await expect(button(page, "Undo")).toBeFocused();
        await step(page, "Tab", "After");
    });

    test("the popup's ToggleGroup and Toggle are no items of the toolbar", async ({
        page,
    }) => {
        const toolbar = page.getByRole("toolbar", { name: "Formatting" });
        await button(page, "More").click();
        const left = button(page, "Left");
        await expect(left).toBeVisible();
        await expect(button(page, "More")).toHaveAttribute("tabindex", "0");
        // the group in the popup is a scope of its own, the Toggle in none
        await expect(left).toHaveAttribute("tabindex", "0");
        await expect(button(page, "Center")).toHaveAttribute("tabindex", "-1");
        await expect(button(page, "Wrap")).not.toHaveAttribute("tabindex");
        await expect(toolbar.locator('[tabindex="0"]')).toHaveCount(1);

        await left.focus();
        await step(page, "ArrowRight", "Center");
        await step(page, "ArrowRight", "Left");
        await button(page, "Center").focus();
        await page.keyboard.press("Space");
        await expectOutput(page, "align", "center");
        await expect(button(page, "More")).toHaveAttribute("tabindex", "0");
        await expect(toolbar.locator('[tabindex="0"]')).toHaveCount(1);
    });
});
