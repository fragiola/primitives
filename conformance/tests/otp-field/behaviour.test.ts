import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/otp-field.md
const digit = (page: Page, n: number) =>
    page.getByRole("textbox", { name: `Digit ${n} of 6`, exact: true });

/** Pastes `text` into a slot, as the clipboard would (a `paste` event with its data). */
async function paste(slot: Locator, text: string): Promise<void> {
    await slot.focus();
    await slot.evaluate((element, data) => {
        const transfer = new DataTransfer();
        transfer.setData("text/plain", data);
        element.dispatchEvent(
            new ClipboardEvent("paste", {
                clipboardData: transfer,
                bubbles: true,
                cancelable: true,
            }),
        );
    }, text);
}

/** Every slot's character, in slot order. */
function slotValues(page: Page, prefix: string, count: number) {
    return Promise.all(
        Array.from({ length: count }, (_, index) =>
            page
                .getByLabel(`${prefix} ${index + 1} of ${count}`, {
                    exact: true,
                })
                .inputValue(),
        ),
    );
}

test.describe("otp-field / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/otp-field/basic");
    });

    test("a named group of slots, one tab stop, one-time-code autofill on the first", async ({
        page,
    }) => {
        const group = page.getByRole("group", {
            name: "Verification code",
            exact: true,
        });
        await expect(group.getByRole("textbox")).toHaveCount(6);
        for (let n = 1; n <= 6; n += 1) {
            await expect(digit(page, n)).toHaveAttribute(
                "tabindex",
                n === 1 ? "0" : "-1",
            );
            await expect(digit(page, n)).toHaveAttribute(
                "autocomplete",
                n === 1 ? "one-time-code" : "off",
            );
        }
        await expect(digit(page, 1)).toHaveAttribute("maxlength", "6");
        await expect(digit(page, 2)).not.toHaveAttribute("maxlength");
    });

    test("typing moves forward; a refused character stays out; the last slot completes it", async ({
        page,
    }) => {
        await page.getByText("Verification code", { exact: true }).click();
        await expect(digit(page, 1)).toBeFocused();
        await page.keyboard.type("1");
        await expectOutput(page, "value", "1");
        await expectOutput(page, "reason", "input-change");
        await expect(digit(page, 2)).toBeFocused();
        await page.keyboard.type("a");
        await expectOutput(page, "invalid", "a");
        await expectOutput(page, "value", "1");
        await expect(digit(page, 2)).toBeFocused();
        await expect(digit(page, 2)).toHaveValue("");
        await page.keyboard.type("23456");
        await expectOutput(page, "value", "123456");
        await expectOutput(page, "complete", "123456");
        await expect(digit(page, 6)).toBeFocused();
        await expect(
            page.locator('[data-primitives-part="otp-field-root"]').first(),
        ).toHaveAttribute("data-complete", "");
        expect(await slotValues(page, "Digit", 6)).toEqual([
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
        ]);
    });

    test("Backspace moves back; the arrows, Home and End move; Delete and Control+Backspace remove", async ({
        page,
    }) => {
        await digit(page, 1).focus();
        await page.keyboard.type("123456");
        await page.keyboard.press("Backspace");
        await expectOutput(page, "value", "12345");
        await expectOutput(page, "reason", "keyboard");
        await expect(digit(page, 5)).toBeFocused();
        await page.keyboard.press("ArrowLeft");
        await expect(digit(page, 4)).toBeFocused();
        await page.keyboard.press("Home");
        await expect(digit(page, 1)).toBeFocused();
        await page.keyboard.press("End");
        await expect(digit(page, 6)).toBeFocused();
        await page.keyboard.press("Home");
        await page.keyboard.press("ArrowRight");
        await expect(digit(page, 2)).toBeFocused();
        await page.keyboard.press("Delete");
        await expectOutput(page, "value", "1345");
        await expect(digit(page, 2)).toBeFocused();
        await page.keyboard.press("Control+Backspace");
        await expectOutput(page, "value", "empty");
        await expect(digit(page, 1)).toBeFocused();
    });

    test("a press after the first empty slot focuses the first empty slot", async ({
        page,
    }) => {
        await digit(page, 1).focus();
        await page.keyboard.type("12");
        await digit(page, 5).click();
        await expect(digit(page, 3)).toBeFocused();
    });

    test("a paste spreads the code; refused characters are reported", async ({
        page,
    }) => {
        await paste(digit(page, 1), "98 76 54");
        await expectOutput(page, "value", "987654");
        await expectOutput(page, "reason", "input-paste");
        await expectOutput(page, "complete", "987654");
        await expect(digit(page, 6)).toBeFocused();
        await page.keyboard.press("Control+Backspace");
        await paste(digit(page, 1), "12-34");
        await expectOutput(page, "value", "1234");
        await expectOutput(page, "invalid", "12-34");
        await expect(digit(page, 5)).toBeFocused();
    });

    test("a native form submits a complete code, refuses an incomplete one, and resets it", async ({
        page,
    }) => {
        await paste(digit(page, 1), "987654");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "code=987654");
        await digit(page, 1).focus();
        await page.keyboard.press("Control+Backspace");
        await page.keyboard.type("12");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(digit(page, 3)).toBeFocused();
        await expectSubmitted(page, "code=987654");
        await page.getByRole("button", { name: "Reset" }).click();
        await expect
            .poll(() => slotValues(page, "Digit", 6))
            .toEqual(["", "", "", "", "", ""]);
        await expect(digit(page, 1)).toHaveAttribute("tabindex", "0");
        await expect(digit(page, 3)).toHaveAttribute("tabindex", "-1");
    });

    test("read-only and disabled codes", async ({ page }) => {
        expect(await slotValues(page, "Backup digit", 4)).toEqual([
            "2",
            "4",
            "6",
            "8",
        ]);
        const first = page.getByLabel("Backup digit 1 of 4", { exact: true });
        await first.focus();
        await page.keyboard.type("9");
        await page.keyboard.press("Backspace");
        expect(await slotValues(page, "Backup digit", 4)).toEqual([
            "2",
            "4",
            "6",
            "8",
        ]);
        await page.keyboard.press("ArrowRight");
        await expect(
            page.getByLabel("Backup digit 2 of 4", { exact: true }),
        ).toBeFocused();
        for (let n = 1; n <= 4; n += 1) {
            await expect(
                page.getByLabel(`Old digit ${n} of 4`, { exact: true }),
            ).toBeDisabled();
        }
    });

    test("Tab leaves the code at once", async ({ page }) => {
        await digit(page, 1).focus();
        await page.keyboard.press("Tab");
        const inside = await page.evaluate(
            () =>
                document.activeElement?.closest(
                    '[data-primitives-part="otp-field-root"]',
                ) !== null &&
                document.activeElement?.closest(
                    '[data-primitives-part="otp-field-root"]',
                ) ===
                    document.querySelector(
                        '[data-primitives-part="otp-field-root"]',
                    ),
        );
        expect(inside).toBe(false);
    });

    test("has no axe violation, empty and complete", async ({ page }) => {
        await expectNoAxeViolations(page);
        await paste(digit(page, 1), "123456");
        await expectOutput(page, "complete", "123456");
        await expectNoAxeViolations(page);
    });
});

test("otp-field / basic?dir=rtl: the first slot at the right, ArrowLeft moves on", async ({
    page,
}) => {
    await openScenario(page, "/otp-field/basic", { dir: "rtl" });
    const first = await digit(page, 1).boundingBox();
    const second = await digit(page, 2).boundingBox();
    expect(first?.x ?? 0).toBeGreaterThan(second?.x ?? 0);
    await digit(page, 1).focus();
    await page.keyboard.type("12");
    await digit(page, 1).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(digit(page, 2)).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(digit(page, 1)).toBeFocused();
});

test.describe("otp-field / field", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/otp-field/field");
    });

    const slot = (page: Page, n: number) =>
        page.getByLabel(`Character ${n} of 4`, { exact: true });

    test("a field control: named, described, masked, validated, submitted", async ({
        page,
    }) => {
        const group = page.getByRole("group", {
            name: "Sign-in code",
            exact: true,
        });
        await expect(group).toHaveAccessibleDescription("Check your email.");
        for (let n = 1; n <= 4; n += 1) {
            await expect(slot(page, n)).toHaveAttribute("type", "password");
        }
        const error = page.getByText("Enter the 4-character code.");
        await expect(error).toHaveCount(0);
        await expectNoAxeViolations(page);

        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
        await expect(slot(page, 1)).toBeFocused();
        for (let n = 1; n <= 4; n += 1) {
            await expect(slot(page, n)).toHaveAttribute("aria-invalid", "true");
        }
        await expect(error).toBeVisible();
        await expectNoAxeViolations(page);

        await page.keyboard.type("ab1");
        await expect(error).toBeVisible();
        await page.keyboard.type("2");
        await expectOutput(page, "complete", "ab12");
        await expect(error).toHaveCount(0);
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "otp=ab12");
    });

    test("a refused character", async ({ page }) => {
        await slot(page, 1).focus();
        await page.keyboard.type("-");
        await expectOutput(page, "invalid", "-");
        await expect(slot(page, 1)).toHaveValue("");
    });
});
