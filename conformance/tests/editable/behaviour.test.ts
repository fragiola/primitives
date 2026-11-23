import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted, resetForm } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/editable.md. The Preview has no role: it is found by its text.
const textbox = (page: Page, name: string) =>
    page.getByRole("textbox", { name, exact: true });
const button = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true });
const preview = (page: Page, text: string) =>
    page.getByText(text, { exact: true });

/** The textbox is focused with its whole text selected. */
async function expectEditing(page: Page, name: string): Promise<void> {
    const input = textbox(page, name);
    await expect(input).toBeFocused();
    const [start, end, length] = await input.evaluate(
        (element: HTMLInputElement) => [
            element.selectionStart,
            element.selectionEnd,
            element.value.length,
        ],
    );
    expect([start, end]).toEqual([0, length]);
}

test.describe("editable / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/editable/basic");
    });

    test("at rest: the Preview, no textbox, the edit trigger", async ({
        page,
    }) => {
        await expect(preview(page, "Quarterly report")).toHaveAttribute(
            "tabindex",
            "0",
        );
        await expect(page.getByRole("textbox")).toHaveCount(0);
        await expect(button(page, "Edit title")).toBeVisible();
        await expect(button(page, "Save title")).toHaveCount(0);
        await expect(button(page, "Cancel edit")).toHaveCount(0);
        await expectNoAxeViolations(page);
    });

    test("Tab to the Preview starts an edit; Enter commits and the focus returns to the edit trigger", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await expectEditing(page, "Title");
        await expect(preview(page, "Quarterly report")).toBeHidden();
        await expect(button(page, "Edit title")).toHaveCount(0);
        await expect(button(page, "Save title")).toBeVisible();
        await expect(button(page, "Cancel edit")).toBeVisible();
        await expectNoAxeViolations(page);

        await page.keyboard.type("Annual report");
        await expectOutput(page, "value", "Annual report");
        await page.keyboard.press("Enter");
        await expectOutput(page, "commit", "Annual report (keyboard)");
        await expect(preview(page, "Annual report")).toBeVisible();
        await expect(button(page, "Edit title")).toBeFocused();
    });

    test("Escape reverts and the focus returns to the edit trigger", async ({
        page,
    }) => {
        await button(page, "Edit title").focus();
        await page.keyboard.press("Enter");
        await expectEditing(page, "Title");
        await page.keyboard.type("Draft");
        await expectOutput(page, "value", "Draft");
        await page.keyboard.press("Escape");
        await expectOutput(page, "revert", "Quarterly report (escape-key)");
        await expectOutput(page, "value", "Quarterly report");
        await expect(preview(page, "Quarterly report")).toBeVisible();
        await expect(button(page, "Edit title")).toBeFocused();
    });

    test("the submit and cancel triggers commit and revert", async ({
        page,
    }) => {
        await button(page, "Edit title").click();
        await expectEditing(page, "Title");
        await page.keyboard.type("Budget");
        await button(page, "Save title").click();
        await expectOutput(page, "commit", "Budget (submit-press)");
        await expect(button(page, "Edit title")).toBeFocused();

        await button(page, "Edit title").click();
        await page.keyboard.type("Plan");
        await button(page, "Cancel edit").click();
        await expectOutput(page, "revert", "Budget (cancel-press)");
        await expect(preview(page, "Budget")).toBeVisible();
        await expect(button(page, "Edit title")).toBeFocused();
    });

    test("Tab through the triggers keeps the edit; leaving commits and the focus stays", async ({
        page,
    }) => {
        await button(page, "Edit title").click();
        await page.keyboard.type("Budget");
        await page.keyboard.press("Tab");
        await expect(button(page, "Save title")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(button(page, "Cancel edit")).toBeFocused();
        await expect(textbox(page, "Title")).toBeVisible();
        await expectOutput(page, "commit", "none");
        await page.keyboard.press("Tab");
        await expectOutput(page, "commit", "Budget (input-blur)");
        await expect(button(page, "After")).toBeFocused();
    });

    test("a press on the page's background commits and the focus returns", async ({
        page,
    }) => {
        await button(page, "Edit title").click();
        await page.keyboard.type("Memo");
        await page.mouse.click(600, 20);
        await expectOutput(page, "commit", "Memo (input-blur)");
        await expect(button(page, "Edit title")).toBeFocused();
    });

    test("the form submits and resets the value", async ({ page }) => {
        await button(page, "Edit title").click();
        await page.keyboard.type("Memo");
        await page.keyboard.press("Enter");
        await button(page, "Submit").click();
        await expectSubmitted(page, "title=Memo");
        await button(page, "Reset").click();
        await expectOutput(page, "value", "Quarterly report");
        await expect(preview(page, "Quarterly report")).toBeVisible();
    });

    test("a form reset ends an edit, neither committed nor reverted", async ({
        page,
    }) => {
        await button(page, "Edit title").click();
        await page.keyboard.type("Memo");
        await resetForm(page);
        await expect(preview(page, "Quarterly report")).toBeVisible();
        await expect(textbox(page, "Title")).toHaveCount(0);
        await expectOutput(page, "commit", "none");
        await expectOutput(page, "revert", "none");
        await expect(button(page, "Edit title")).toBeFocused();
    });
});

test.describe("editable / modes", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/editable/modes");
    });

    test("dblclick and enter: the focus returns to the Preview", async ({
        page,
    }) => {
        await preview(page, "Ana").click();
        await expect(textbox(page, "Name")).toHaveCount(0);
        await preview(page, "Ana").dblclick();
        await expectEditing(page, "Name");
        await page.keyboard.type("Bea");
        await page.keyboard.press("Enter");
        await expectOutput(page, "Name commit", "Bea (keyboard)");
        await expect(preview(page, "Bea")).toBeFocused();
        await expect(textbox(page, "Name")).toHaveCount(0);

        await preview(page, "Bea").dblclick();
        await expectEditing(page, "Name");
        await page.keyboard.type("Cy");
        await page.keyboard.press("Tab");
        await expectOutput(page, "Name revert", "Bea (input-blur)");
        await expect(button(page, "Edit team")).toBeFocused();
    });

    test("click and blur: Enter does not commit, leaving does", async ({
        page,
    }) => {
        await preview(page, "Designer").click();
        await expectEditing(page, "Role");
        await page.keyboard.type("Lead");
        await page.keyboard.press("Enter");
        await expect(textbox(page, "Role")).toBeFocused();
        await expectOutput(page, "Role commit", "none");
        await page.keyboard.press("Escape");
        await expectOutput(page, "Role revert", "Designer (escape-key)");
        await expect(preview(page, "Designer")).toBeFocused();

        await preview(page, "Designer").click();
        await page.keyboard.type("Lead");
        await button(page, "After").click();
        await expectOutput(page, "Role commit", "Lead (input-blur)");
        await expect(button(page, "After")).toBeFocused();
    });

    test("none and none: only the triggers", async ({ page }) => {
        await expect(preview(page, "Core")).toHaveAttribute("tabindex", "-1");
        await preview(page, "Core").click();
        await expect(textbox(page, "Team")).toHaveCount(0);
        await button(page, "Edit team").click();
        await expectEditing(page, "Team");
        await page.keyboard.press("Enter");
        await expect(textbox(page, "Team")).toBeFocused();
        await button(page, "Save team").click();
        await expectOutput(page, "Team commit", "Core (submit-press)");
        await expect(button(page, "Edit team")).toBeFocused();

        await button(page, "Edit team").click();
        await page.keyboard.type("Web");
        await page.keyboard.press("Tab");
        await expect(button(page, "Save team")).toBeFocused();
        await expectOutput(page, "Team revert", "none");
        await button(page, "After").click();
        await expectOutput(page, "Team revert", "Core (input-blur)");
    });

    test("a textarea: Enter breaks the line, Control+Enter commits", async ({
        page,
    }) => {
        await button(page, "After").focus();
        await page.keyboard.press("Shift+Tab");
        await expectEditing(page, "Notes");
        await expect(textbox(page, "Notes")).toHaveJSProperty(
            "localName",
            "textarea",
        );
        await page.keyboard.press("End");
        await page.keyboard.press("Enter");
        await expect(textbox(page, "Notes")).toHaveValue("First line\n");
        await expectOutput(page, "Notes commit", "none");
        await page.keyboard.press("Control+Enter");
        await expectOutput(page, "Notes commit", "First line\\n (keyboard)");
        await expect(textbox(page, "Notes")).toHaveCount(0);
        await expect(
            page.locator('[data-primitives-part="editable-preview"]').nth(3),
        ).toBeFocused();
    });
});

test.describe("editable / states", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/editable/states");
    });

    test("a placeholder and a maximum length", async ({ page }) => {
        await expect(preview(page, "Add a subtitle")).toBeVisible();
        await button(page, "Edit subtitle").click();
        const input = textbox(page, "Subtitle");
        await expect(input).toBeFocused();
        await expect(input).toHaveAttribute("placeholder", "Add a subtitle");
        await expect(input).toHaveAttribute("maxlength", "12");
        await page.keyboard.type("A very long subtitle");
        await expect(input).toHaveValue("A very long ");
    });

    test("disabled and read-only: no edit", async ({ page }) => {
        await expect(button(page, "Edit owner")).toBeDisabled();
        await expect(preview(page, "Ana")).not.toHaveAttribute("tabindex");
        await expect(button(page, "Edit created")).toBeDisabled();
        await expect(preview(page, "2026-11-23")).not.toHaveAttribute(
            "tabindex",
        );
        await preview(page, "2026-11-23").click();
        await preview(page, "2026-11-23").dblclick();
        await expect(textbox(page, "Created")).toHaveCount(0);
        await expectNoAxeViolations(page);
    });
});

test.describe("editable / field", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/editable/field");
    });

    test("a failed submission starts an edit; a commit submits", async ({
        page,
    }) => {
        await expectNoAxeViolations(page);
        await button(page, "Submit").click();
        await expectSubmitted(page, "none");
        const input = textbox(page, "Project name");
        await expect(input).toBeFocused();
        await expect(input).toHaveAccessibleDescription(
            /Shown on the dashboard\./,
        );
        await expect(input).toHaveAttribute("required", "");
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(page.getByText("Enter a project name.")).toBeVisible();
        await expectNoAxeViolations(page);

        await page.keyboard.type("Atlas");
        await page.keyboard.press("Enter");
        await expect(page.getByText("Enter a project name.")).toBeHidden();
        await button(page, "Submit").click();
        await expectSubmitted(page, "project=Atlas");
    });
});
