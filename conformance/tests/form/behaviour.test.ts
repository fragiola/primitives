import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted, resetForm } from "../../src/form.ts";
import { expectOutput, output } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/form.md
const textbox = (page: Page, name: string) =>
    page.getByRole("textbox", { name, exact: true });
const submit = (page: Page) => page.getByRole("button", { name: "Submit" });
const shown = (page: Page, text: string) =>
    expect(page.getByText(text, { exact: true })).toBeVisible();
const hidden = (page: Page, text: string) =>
    expect(page.getByText(text, { exact: true })).toHaveCount(0);
const taken = "This username is taken.";

test.describe("form / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/form/basic");
    });

    test("a named form, validated by the Form, with no error at first", async ({
        page,
    }) => {
        const form = page.getByRole("form", { name: "Sign up", exact: true });
        await expect(form).toHaveAttribute("novalidate", "");
        await hidden(page, "Enter your email.");
        await hidden(page, taken);
    });

    test("the Form's validationMode is its fields' default", async ({
        page,
    }) => {
        const email = textbox(page, "Email");
        await email.fill("ada@gmail.com");
        await hidden(page, "Use your work email.");
        await page.keyboard.press("Tab");
        await shown(page, "Use your work email.");
        await expect(email).toHaveAttribute("aria-invalid", "true");
    });

    test("a blocked submission shows the errors and focuses the first invalid field", async ({
        page,
    }) => {
        const email = textbox(page, "Email");
        await email.fill("ada@gmail.com");
        await email.fill("");
        await textbox(page, "Username").focus();
        await submit(page).click();
        await expectSubmitted(page, "none");
        await shown(page, "Enter your email.");
        await expect(email).toBeFocused();
    });

    test("server errors show on their field, focus it, block a submission, and clear on change", async ({
        page,
    }) => {
        const username = textbox(page, "Username");
        await textbox(page, "Email").fill("ada@example.com");
        await username.fill("admin");
        await submit(page).click();
        await expectSubmitted(page, "email=ada@example.com&username=admin");
        await shown(page, taken);
        await expect(username).toHaveAttribute("aria-invalid", "true");
        await expect(username).toHaveAccessibleDescription(taken);
        await expect(username).toBeFocused();

        // blocked by the server's error: the consumer's listener never runs, so the output keeps
        // the last submission
        await submit(page).click();
        await expect(username).toBeFocused();
        await shown(page, taken);
        await expectSubmitted(page, "email=ada@example.com&username=admin");

        await username.press("End");
        await page.keyboard.type("s");
        await hidden(page, taken);
        await expect(username).not.toHaveAttribute("aria-invalid");
        await expectOutput(page, "cleared", "empty");
        await submit(page).click();
        await expectSubmitted(page, "email=ada@example.com&username=admins");
    });

    test("a form reset keeps the server's errors", async ({ page }) => {
        const username = textbox(page, "Username");
        await textbox(page, "Email").fill("ada@example.com");
        await username.fill("admin");
        await submit(page).click();
        await shown(page, taken);
        await resetForm(page);
        // the controls reset a task after the reset event: let it pass, and the render after it
        await page.waitForTimeout(200);
        await shown(page, taken);
        await expect(username).toHaveAttribute("aria-invalid", "true");
        await expect(output(page)).not.toContainText("cleared: empty");
    });

    test("has no axe violation, before and after the server's answer", async ({
        page,
    }) => {
        await expectNoAxeViolations(page);
        await textbox(page, "Email").fill("ada@example.com");
        await textbox(page, "Username").fill("admin");
        await submit(page).click();
        await shown(page, taken);
        await expectNoAxeViolations(page);
    });
});
