import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// otp-field: a sign-in code (spec/otp-field.md). A group "Sign-in code" of six slots "Digit 1 of
// 6" ... "Digit 6 of 6"; a status line that reports the complete code.

test("typing fills the code and moves forward; Backspace moves back", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "otp-field" });
    const group = frame.getByRole("group", { name: "Sign-in code" });
    await expect(group).toHaveAttribute(
        "data-primitives-part",
        "otp-field-root",
    );
    const digit = (n: number) =>
        frame.getByRole("textbox", { name: `Digit ${n} of 6` });
    await digit(1).focus();
    await digit(1).pressSequentially("1234");
    await expect(digit(5)).toBeFocused();
    await page.keyboard.press("Backspace");
    await expect(digit(4)).toBeFocused();
    await expect(digit(4)).toHaveValue("");
    await page.keyboard.type("45");
    await expect(frame.getByText("Enter the code we sent you.")).toBeVisible();
    await page.keyboard.type("6");
    await expect(frame.getByText("Code 123456 entered.")).toBeVisible();
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("otp-field");
    await page.goto(`${EMBED_BASE}?id=otp-field`);
    await expect(page.getByRole("textbox")).toHaveCount(6);
    expect(await axeViolations(page)).toEqual([]);
});
