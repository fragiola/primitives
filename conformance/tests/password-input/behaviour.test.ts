import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/password-input.md
const trigger = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true });

/** The Input's selection, as `[start, end]`. */
const selectionOf = (page: Page, label: string) =>
    page
        .getByLabel(label, { exact: true })
        .evaluate((input: HTMLInputElement) => [
            input.selectionStart,
            input.selectionEnd,
        ]);

test.describe("password-input / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/password-input/basic");
    });

    test("a password input and its toggle button", async ({ page }) => {
        const input = page.getByLabel("Password", { exact: true });
        await expect(input).toHaveAttribute("type", "password");
        await expect(input).toHaveAttribute("autocomplete", "current-password");
        await expect(input).toHaveAttribute("autocapitalize", "off");
        await expect(input).toHaveAttribute("spellcheck", "false");
        const button = trigger(page, "Show password");
        await expect(button).toHaveAttribute("aria-pressed", "false");
        await expect(button).toHaveAttribute(
            "aria-controls",
            (await input.getAttribute("id")) ?? "",
        );
        await expectNoAxeViolations(page);
    });

    test("typing reports the value", async ({ page }) => {
        await page.getByLabel("Password", { exact: true }).fill("hunter2");
        await expectOutput(page, "value", "hunter2");
        await expectOutput(page, "reason", "input-change");
    });

    test("a mouse press shows the text and keeps the focus, the value and the selection", async ({
        page,
    }) => {
        const input = page.getByLabel("Password", { exact: true });
        await input.fill("hunter2");
        await input.evaluate((element: HTMLInputElement) =>
            element.setSelectionRange(1, 4),
        );
        await trigger(page, "Show password").click();
        await expect(input).toHaveAttribute("type", "text");
        await expect(
            page.getByRole("textbox", { name: "Password", exact: true }),
        ).toBeVisible();
        await expect(trigger(page, "Show password")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        await expectOutput(page, "visible", "true");
        await expectOutput(page, "reason", "trigger-press");
        await expect(input).toBeFocused();
        await expect(input).toHaveValue("hunter2");
        expect(await selectionOf(page, "Password")).toEqual([1, 4]);
        await expectNoAxeViolations(page);

        await trigger(page, "Show password").click();
        await expect(input).toHaveAttribute("type", "password");
        await expectOutput(page, "visible", "false");
        await expect(input).toBeFocused();
        expect(await selectionOf(page, "Password")).toEqual([1, 4]);
    });

    test("the keyboard toggles it and the focus stays on the trigger", async ({
        page,
    }) => {
        const input = page.getByLabel("Password", { exact: true });
        await input.focus();
        await page.keyboard.press("Tab");
        const button = trigger(page, "Show password");
        await expect(button).toBeFocused();
        await page.keyboard.press("Space");
        await expect(button).toHaveAttribute("aria-pressed", "true");
        await expect(input).toHaveAttribute("type", "text");
        await expect(button).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(button).toHaveAttribute("aria-pressed", "false");
        await expect(input).toHaveAttribute("type", "password");
        await expect(button).toBeFocused();
    });

    test("a submission submits the text and hides it", async ({ page }) => {
        const input = page.getByLabel("Password", { exact: true });
        await input.fill("hunter2");
        await trigger(page, "Show password").click();
        await expect(input).toHaveAttribute("type", "text");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "password=hunter2");
        await expect(input).toHaveAttribute("type", "password");
        await expectOutput(page, "visible", "false");
        await expectOutput(page, "reason", "none");
    });

    test("a reset empties it", async ({ page }) => {
        const input = page.getByLabel("Password", { exact: true });
        await input.fill("hunter2");
        await page.getByRole("button", { name: "Reset" }).click();
        await expect(input).toHaveValue("");
        await expectOutput(page, "value", "");
        await expectOutput(page, "reason", "none");
    });
});

test.describe("password-input / states", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/password-input/states");
    });

    test("a disabled Root changes nothing", async ({ page }) => {
        const input = page.getByLabel("PIN", { exact: true });
        await expect(input).toBeDisabled();
        await expect(input).toHaveAttribute("type", "password");
        const button = trigger(page, "Show PIN");
        await expect(button).toBeDisabled();
        await button.click({ force: true });
        await expect(input).toHaveAttribute("type", "password");
        await expectOutput(page, "visible", "none");
    });

    test("a read-only Root still toggles", async ({ page }) => {
        const input = page.getByLabel("Recovery key", { exact: true });
        await expect(input).toHaveAttribute("readonly", "");
        await expect(input).toHaveAttribute("type", "text");
        const button = trigger(page, "Show recovery key");
        await expect(button).toHaveAttribute("aria-pressed", "true");
        await button.click();
        await expect(input).toHaveAttribute("type", "password");
        await expectOutput(page, "visible", "false");
    });

    test("the tab order skips the disabled parts", async ({ page }) => {
        await page.keyboard.press("Tab");
        await expect(
            page.getByLabel("Recovery key", { exact: true }),
        ).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(trigger(page, "Show recovery key")).toBeFocused();
    });
});

test.describe("password-input / field", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/password-input/field");
    });

    test("labelled, described, validated and submitted", async ({ page }) => {
        const input = page.getByLabel("New password", { exact: true });
        await expect(input).toHaveAccessibleDescription(
            "At least 8 characters.",
        );
        await expect(input).toHaveAttribute("required", "");
        await expect(input).not.toHaveAttribute("aria-invalid");
        await expectNoAxeViolations(page);

        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
        await expect(input).toBeFocused();
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(
            page.getByText("Enter a password of 8 characters or more."),
        ).toBeVisible();
        await expectNoAxeViolations(page);

        await input.fill("correct horse");
        await expect(
            page.getByText("Enter a password of 8 characters or more."),
        ).toBeHidden();
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "new-password=correct horse");
    });
});
