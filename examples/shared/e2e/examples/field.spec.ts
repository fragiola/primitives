import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// field: a sign-up email in a form (spec/field.md).

test("the label and description are wired; a failed submission shows the error and focuses the input", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "field" });
    const email = frame.getByRole("textbox", { name: "Email" });
    await expect(email).toHaveAttribute(
        "data-primitives-part",
        "field-control",
    );
    await expect(email).toHaveAccessibleDescription("We never share it.");
    await expect(email).not.toHaveAttribute("aria-invalid");

    await frame.getByRole("button", { name: "Sign up" }).click();
    await expect(email).toBeFocused();
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(frame.getByText("Enter your email.")).toBeVisible();
    await expect(email).toHaveAccessibleDescription(
        "We never share it. Enter your email.",
    );

    // after a submission, every change validates
    await email.fill("ada");
    await expect(frame.getByText("Enter a valid email.")).toBeVisible();
    await email.fill("ada@example.com");
    await expect(email).not.toHaveAttribute("aria-invalid");
    await expect(frame.getByText("Enter a valid email.")).toHaveCount(0);
    expect(errors).toEqual([]);
});

test("axe finds no violation, before and after a failed submission", async ({
    page,
}) => {
    requireExamples("field");
    await page.goto(`${EMBED_BASE}?id=field`);
    expect(await axeViolations(page)).toEqual([]);
    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(page.getByText("Enter your email.")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
