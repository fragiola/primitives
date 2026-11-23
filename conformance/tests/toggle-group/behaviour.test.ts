import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/toggle-group.md
const button = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true });

/** Presses `key` and expects the focus on `name`. */
async function step(page: Page, key: string, name: string): Promise<void> {
    await page.keyboard.press(key);
    await expect(button(page, name)).toBeFocused();
}

test.describe("toggle-group / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/toggle-group/basic");
    });

    test("a named group of four toggles, the default pressed", async ({
        page,
    }) => {
        const group = page.getByRole("group", { name: "Alignment" });
        await expect(group.getByRole("button")).toHaveCount(4);
        await expect(button(page, "Left")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        for (const name of ["Center", "Right", "Justify"]) {
            await expect(button(page, name)).toHaveAttribute(
                "aria-pressed",
                "false",
            );
        }
        await expect(button(page, "Justify")).toBeDisabled();
    });

    test("the group is one tab stop", async ({ page }) => {
        await button(page, "Before").focus();
        await step(page, "Tab", "Left");
        await step(page, "Tab", "After");
        await step(page, "Shift+Tab", "Left");
    });

    test("the arrows, Home and End move the focus only, skip the disabled toggle and wrap", async ({
        page,
    }) => {
        await button(page, "Left").focus();
        await step(page, "ArrowRight", "Center");
        await step(page, "ArrowRight", "Right");
        await step(page, "ArrowRight", "Left");
        await step(page, "ArrowLeft", "Right");
        await step(page, "Home", "Left");
        await step(page, "End", "Right");
        await step(page, "ArrowDown", "Right");
        await step(page, "ArrowUp", "Right");
        await expectOutput(page, "value", "none");
        await expect(button(page, "Left")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
    });

    test("the toggle that last had focus keeps the tab stop", async ({
        page,
    }) => {
        await button(page, "Left").focus();
        await step(page, "End", "Right");
        await step(page, "Tab", "After");
        await step(page, "Shift+Tab", "Right");
    });

    test("a press replaces the single value, a second press empties it", async ({
        page,
    }) => {
        await button(page, "Center").click();
        await expect(button(page, "Center")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        await expect(button(page, "Left")).toHaveAttribute(
            "aria-pressed",
            "false",
        );
        await expectOutput(page, "value", "center");
        await expectOutput(page, "reason", "none");
        await button(page, "Center").click();
        await expect(button(page, "Center")).toHaveAttribute(
            "aria-pressed",
            "false",
        );
        await expectOutput(page, "value", "");
    });

    test("Space presses the focused toggle, Enter releases it", async ({
        page,
    }) => {
        await button(page, "Left").focus();
        await step(page, "End", "Right");
        await page.keyboard.press("Space");
        await expectOutput(page, "value", "right");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("toggle-group / basic, right to left", () => {
    test("ArrowLeft is the next toggle; Home and End do not change", async ({
        page,
    }) => {
        await openScenario(page, "/toggle-group/basic", { dir: "rtl" });
        await button(page, "Left").focus();
        await step(page, "ArrowLeft", "Center");
        await step(page, "ArrowLeft", "Right");
        await step(page, "ArrowRight", "Center");
        await step(page, "Home", "Left");
        await step(page, "End", "Right");
    });
});

test.describe("toggle-group / vertical", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/toggle-group/vertical");
    });

    test("multiple: a press adds or removes its value", async ({ page }) => {
        await expect(button(page, "Bold")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        await button(page, "Italic").click();
        await expectOutput(page, "value", "bold,italic");
        await expect(button(page, "Bold")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        await expect(button(page, "Italic")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        await button(page, "Bold").click();
        await expectOutput(page, "value", "italic");
        await expect(button(page, "Bold")).toHaveAttribute(
            "aria-pressed",
            "false",
        );
    });

    test("the vertical arrows move the focus, without loop; the horizontal ones do nothing", async ({
        page,
    }) => {
        await button(page, "Bold").focus();
        await step(page, "ArrowDown", "Italic");
        await step(page, "ArrowDown", "Underline");
        await step(page, "ArrowDown", "Underline");
        await step(page, "ArrowUp", "Italic");
        await step(page, "ArrowRight", "Italic");
        await step(page, "ArrowLeft", "Italic");
        await step(page, "Home", "Bold");
        await step(page, "End", "Underline");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});
