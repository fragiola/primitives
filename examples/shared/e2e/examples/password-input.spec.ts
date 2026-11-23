import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// password-input: a sign-in form (spec/password-input.md). A `<label for="email">` "Email" and an
// email input holding "ada@example.com"; a `<label for="password">` "Password" and a required
// PasswordInput (`name="password"`, `autoComplete="current-password"`) with its trigger "Show
// password" (an eye icon); a "Sign in" submit button; a status: empty, then "Signed in as
// <email>." after a submission.

test("the eye button shows and hides the password, keeping the focus in it", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "password-input" });
    const input = frame.getByLabel("Password", { exact: true });
    const trigger = frame.getByRole("button", { name: "Show password" });
    await expect(input).toHaveAttribute("type", "password");
    await expect(input).toHaveAttribute(
        "data-primitives-part",
        "password-input-input",
    );
    await expect(trigger).toHaveAttribute("aria-pressed", "false");

    await input.fill("correct horse");
    await trigger.click();
    await expect(input).toHaveAttribute("type", "text");
    await expect(trigger).toHaveAttribute("aria-pressed", "true");
    await expect(input).toBeFocused();
    await expect(input).toHaveValue("correct horse");
    await trigger.click();
    await expect(input).toHaveAttribute("type", "password");
    await expect(input).toBeFocused();
    expect(errors).toEqual([]);
});

test("signing in submits the password and hides it again", async ({ page }) => {
    const frame = await openHosted(page, { id: "password-input" });
    const input = frame.getByLabel("Password", { exact: true });
    const signIn = frame.getByRole("button", { name: "Sign in" });
    await signIn.click();
    // required: the browser's validation keeps the form and focuses the field
    await expect(input).toBeFocused();
    await expect(frame.getByRole("status")).toHaveText("");

    await input.fill("correct horse");
    await frame.getByRole("button", { name: "Show password" }).click();
    await expect(input).toHaveAttribute("type", "text");
    await signIn.click();
    await expect(frame.getByRole("status")).toHaveText(
        "Signed in as ada@example.com.",
    );
    await expect(input).toHaveAttribute("type", "password");
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("password-input");
    await page.goto(`${EMBED_BASE}?id=password-input`);
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
