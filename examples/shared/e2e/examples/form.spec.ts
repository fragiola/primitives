import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// form: create an account (spec/form.md). A Form named "Create account": a field "Email"
// (`type="email"`, required; "Enter your email." / "Enter a valid email."), a field "Username"
// (required; "Choose a username.", and an Error with no match for the server's answer), a
// "Create account" button and a status. The example plays the server: a submission with the
// username `admin` is answered with `errors` `{ username: "This username is taken." }`; any other
// prints "Account created for <username>." in the status.

test("a submission validates every field and focuses the first invalid one", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "form" });
    const form = frame.getByRole("form", { name: "Create account" });
    await expect(form).toHaveAttribute("data-primitives-part", "form-root");
    const email = frame.getByRole("textbox", { name: "Email" });
    await frame.getByRole("button", { name: "Create account" }).click();
    await expect(email).toBeFocused();
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(frame.getByText("Enter your email.")).toBeVisible();
    await expect(frame.getByText("Choose a username.")).toBeVisible();
    await expect(frame.getByRole("status")).toHaveText("");
    expect(errors).toEqual([]);
});

test("the server's answer shows on its field, focuses it, and typing clears it", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "form" });
    const email = frame.getByRole("textbox", { name: "Email" });
    const username = frame.getByRole("textbox", { name: "Username" });
    await email.fill("ada@example.com");
    await username.fill("admin");
    await frame.getByRole("button", { name: "Create account" }).click();
    await expect(frame.getByText("This username is taken.")).toBeVisible();
    await expect(username).toBeFocused();
    await expect(username).toHaveAttribute("aria-invalid", "true");
    await expect(username).toHaveAccessibleDescription(
        "This username is taken.",
    );
    await username.fill("ada");
    await expect(frame.getByText("This username is taken.")).toHaveCount(0);
    await expect(username).not.toHaveAttribute("aria-invalid");
    await frame.getByRole("button", { name: "Create account" }).click();
    await expect(frame.getByRole("status")).toHaveText(
        "Account created for ada.",
    );
});

test("axe finds no violation, before and after the server's answer", async ({
    page,
}) => {
    requireExamples("form");
    await page.goto(`${EMBED_BASE}?id=form`);
    expect(await axeViolations(page)).toEqual([]);
    await page.getByRole("textbox", { name: "Email" }).fill("ada@example.com");
    await page.getByRole("textbox", { name: "Username" }).fill("admin");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("This username is taken.")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
