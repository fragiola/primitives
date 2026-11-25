import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/number-field.md
const spin = (page: Page, name: string) =>
    page.getByRole("spinbutton", { name, exact: true });

/** The last change the scenario printed: its value and its reason. */
async function expectChange(page: Page, value: string, reason: string) {
    await expectOutput(page, "value", value);
    await expectOutput(page, "reason", reason);
}

/** Selects the input's text and types `text` over it. */
async function typeOver(input: Locator, text: string): Promise<void> {
    await input.focus();
    await input.press("ControlOrMeta+a");
    await input.pressSequentially(text);
}

test.describe("number-field / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/number-field/basic");
    });

    test("a spinbutton with its value and bounds; the buttons out of the tab order", async ({
        page,
    }) => {
        const input = spin(page, "Quantity");
        await expect(input).toHaveAttribute("aria-valuenow", "1");
        await expect(input).toHaveAttribute("aria-valuemin", "1");
        await expect(input).toHaveAttribute("aria-valuemax", "10");
        await expect(input).toHaveAttribute("aria-valuetext", "1");
        await expect(input).toHaveValue("1");
        const decrease = page.getByRole("button", { name: "Decrease" });
        const increase = page.getByRole("button", { name: "Increase" });
        await expect(decrease).toBeDisabled();
        await expect(increase).toBeEnabled();
        await expect(decrease).toHaveAttribute("tabindex", "-1");
        await expect(increase).toHaveAttribute("tabindex", "-1");
        await expectOutput(page, "value", "none");
    });

    test("the keys step it within its bounds", async ({ page }) => {
        const input = spin(page, "Quantity");
        await input.focus();
        await input.press("ArrowUp");
        await expectChange(page, "2", "keyboard");
        await input.press("Shift+ArrowUp");
        await expectChange(page, "7", "keyboard");
        await input.press("PageUp");
        await expectChange(page, "10", "keyboard");
        await expect(
            page.getByRole("button", { name: "Increase" }),
        ).toBeDisabled();
        await input.press("ArrowUp");
        await expect(input).toHaveAttribute("aria-valuenow", "10");
        await input.press("Home");
        await expectChange(page, "1", "keyboard");
        await input.press("End");
        await expectChange(page, "10", "keyboard");
        await input.press("PageDown");
        await expectChange(page, "5", "keyboard");
        await input.press("ArrowDown");
        await expectChange(page, "4", "keyboard");
        await expect(input).toHaveValue("4");
        await expect(input).toHaveAttribute("aria-valuetext", "4");
    });

    test("the buttons step it, and the input keeps the focus", async ({
        page,
    }) => {
        const input = spin(page, "Quantity");
        await input.focus();
        await input.press("ArrowUp");
        await input.press("ArrowUp");
        await input.press("ArrowUp");
        await page.getByRole("button", { name: "Increase" }).click();
        await expectChange(page, "5", "increment-press");
        await expect(input).toBeFocused();
        await page.getByRole("button", { name: "Decrease" }).click();
        await expectChange(page, "4", "decrement-press");
        await expect(input).toBeFocused();
    });

    test("a held button steps again and again, until it is released", async ({
        page,
    }) => {
        const increase = page.getByRole("button", { name: "Increase" });
        const box = await increase.boundingBox();
        if (box === null) {
            throw new Error("no Increase button");
        }
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.waitForTimeout(1000);
        await page.mouse.up();
        const value = Number(
            await spin(page, "Quantity").getAttribute("aria-valuenow"),
        );
        expect(value).toBeGreaterThan(6);
        await page.waitForTimeout(300);
        await expect(spin(page, "Quantity")).toHaveAttribute(
            "aria-valuenow",
            String(value),
        );
        await expectOutput(page, "reason", "increment-press");
    });

    test("typing: a number is taken, a letter refused, the blur clamps, an empty text is null", async ({
        page,
    }) => {
        const input = spin(page, "Quantity");
        await typeOver(input, "8");
        await expectChange(page, "8", "input-change");
        await input.pressSequentially("a");
        await expect(input).toHaveValue("8");
        await expectChange(page, "8", "input-change");
        await typeOver(input, "12");
        await expectChange(page, "12", "input-change");
        await input.blur();
        await expectChange(page, "10", "input-blur");
        await expect(input).toHaveValue("10");
        await input.fill("");
        await expectChange(page, "null", "input-clear");
        await expect(input).not.toHaveAttribute("aria-valuenow");
        await expect(input).not.toHaveAttribute("aria-valuetext");
    });

    test("a native form submits and resets it", async ({ page }) => {
        const input = spin(page, "Quantity");
        await typeOver(input, "8");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "quantity=8");
        await input.fill("");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "quantity=");
        await page.getByRole("button", { name: "Reset" }).click();
        await expect(input).toHaveValue("1");
        await expect(input).toHaveAttribute("aria-valuenow", "1");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "quantity=1");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

const LOCALES = [
    { locale: "en-US", price: "2,000.75" },
    { locale: "de-DE", price: "2.000,75" },
    { locale: "ar-EG", price: "٢٠٠٠٫٧٥" },
] as const;

/** `value` in the page's own `Intl.NumberFormat` (the browser's ICU, not Node's). */
function formatted(
    page: Page,
    locale: string,
    value: number,
    options: Intl.NumberFormatOptions,
): Promise<string> {
    return page.evaluate(
        ([lang, number, format]) =>
            new Intl.NumberFormat(
                lang as string,
                format as Intl.NumberFormatOptions,
            ).format(number as number),
        [locale, value, options] as const,
    );
}

const EUR = { style: "currency", currency: "EUR" } as const;
const PERCENT = { style: "percent" } as const;

for (const { locale, price } of LOCALES) {
    for (const dir of locale === "ar-EG"
        ? [undefined, "rtl" as const]
        : [undefined]) {
        test.describe(`number-field / format?locale=${locale}${dir ? "&dir=rtl" : ""}`, () => {
            test.beforeEach(async ({ page }) => {
                await openScenario(page, "/number-field/format", {
                    locale,
                    dir,
                });
            });

            test("writes the locale's currency and percent text", async ({
                page,
            }) => {
                const priceText = await formatted(page, locale, 1234.5, EUR);
                const discountText = await formatted(
                    page,
                    locale,
                    0.25,
                    PERCENT,
                );
                if (locale === "en-US") {
                    expect(priceText).toBe("€1,234.50");
                    expect(discountText).toBe("25%");
                }
                if (locale === "de-DE") {
                    expect(priceText).toBe("1.234,50 €");
                }
                await expect(spin(page, "Price")).toHaveValue(priceText);
                await expect(spin(page, "Price")).toHaveAttribute(
                    "aria-valuetext",
                    priceText,
                );
                await expect(spin(page, "Discount")).toHaveValue(discountText);
                await expect(spin(page, "Discount")).toHaveAttribute(
                    "aria-valuetext",
                    discountText,
                );
            });

            test("steps in the value's units", async ({ page }) => {
                await spin(page, "Price").focus();
                await spin(page, "Price").press("ArrowUp");
                await expectOutput(page, "price", "1235");
                await expect(spin(page, "Price")).toHaveValue(
                    await formatted(page, locale, 1235, EUR),
                );
                await spin(page, "Discount").focus();
                await spin(page, "Discount").press("ArrowUp");
                await expectOutput(page, "discount", "0.26");
            });

            test("reads the locale's typed text", async ({ page }) => {
                const input = spin(page, "Price");
                await typeOver(input, price);
                await expectOutput(page, "price", "2000.75");
                await input.blur();
                await expect(input).toHaveValue(
                    await formatted(page, locale, 2000.75, EUR),
                );
                const discount = spin(page, "Discount");
                await typeOver(discount, "30");
                await expectOutput(page, "discount", "0.3");
                await discount.blur();
                await expect(discount).toHaveValue(
                    await formatted(page, locale, 0.3, PERCENT),
                );
            });
        });
    }
}

/** The middle of the scrub area, where a press starts a scrub. */
async function scrubStart(page: Page): Promise<{ x: number; y: number }> {
    const box = await page.getByTestId("scrub").boundingBox();
    if (box === null) {
        throw new Error("no scrub area");
    }
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

test.describe("number-field / scrub", () => {
    test("a press dragged along the scrub area steps the value (the pointer lock denied)", async ({
        page,
    }) => {
        // a denied lock leaves the real cursor: the movement is the pointer's own, as dispatched
        await page.addInitScript(() => {
            Element.prototype.requestPointerLock = () =>
                Promise.reject(new DOMException("denied", "NotAllowedError"));
        });
        await openScenario(page, "/number-field/scrub");
        const root = page.locator('[data-primitives-part="number-field-root"]');
        const { x, y } = await scrubStart(page);
        await page.mouse.move(x, y);
        await page.mouse.down();
        await expect(root).toHaveAttribute("data-scrubbing", "");
        for (let step = 1; step <= 10; step += 1) {
            await page.mouse.move(x + step * 2, y);
        }
        await expectChange(page, "110", "scrub");
        for (let step = 1; step <= 5; step += 1) {
            await page.mouse.move(x + 20 - step * 2, y);
        }
        await expectChange(page, "105", "scrub");
        await page.mouse.up();
        await expect(root).not.toHaveAttribute("data-scrubbing");
        await expect(spin(page, "Width")).toHaveValue("105");
        // no virtual cursor without the lock
        await expect(
            page.locator(
                '[data-primitives-part="number-field-scrub-area-cursor"]',
            ),
        ).toHaveCount(0);
    });

    test("a locked scrub shows the virtual cursor, until the release", async ({
        page,
    }) => {
        await openScenario(page, "/number-field/scrub");
        const cursor = page.locator(
            '[data-primitives-part="number-field-scrub-area-cursor"]',
        );
        const { x, y } = await scrubStart(page);
        await page.mouse.move(x, y);
        await page.mouse.down();
        await expect
            .poll(() =>
                page.evaluate(
                    () =>
                        document.pointerLockElement?.getAttribute(
                            "data-primitives-part",
                        ) ?? null,
                ),
            )
            .toBe("number-field-scrub-area");
        await expect(cursor).toHaveCount(1);
        expect(
            await cursor.evaluate(
                (element) => element.parentElement === document.body,
            ),
        ).toBe(true);
        await page.mouse.move(x + 10, y);
        await expect(spin(page, "Width")).not.toHaveValue("100");
        await expectOutput(page, "reason", "scrub");
        await page.mouse.up();
        await expect(cursor).toHaveCount(0);
        await expect
            .poll(() => page.evaluate(() => document.pointerLockElement))
            .toBeNull();
    });

    test("the wheel over the focused input steps it, and not while blurred", async ({
        page,
    }) => {
        await openScenario(page, "/number-field/scrub");
        const input = spin(page, "Width");
        await input.focus();
        await input.hover();
        await page.mouse.wheel(0, -100);
        await expectChange(page, "101", "wheel");
        await page.mouse.wheel(0, 100);
        await expectChange(page, "100", "wheel");
        await input.blur();
        await input.hover();
        await page.mouse.wheel(0, -100);
        await page.waitForTimeout(100);
        await expect(input).toHaveValue("100");
    });
});

test.describe("number-field / field", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/number-field/field");
    });

    test("a field control: named, described, validated, submitted", async ({
        page,
    }) => {
        const input = spin(page, "Guests");
        await expect(input).toHaveAccessibleDescription("Up to 8 guests.");
        await expect(input).toHaveValue("");
        const error = page.getByText("Enter between 1 and 8 guests.");
        await expect(error).toHaveCount(0);
        await expectNoAxeViolations(page);

        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
        await expect(input).toBeFocused();
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(error).toBeVisible();
        await expectNoAxeViolations(page);

        await input.pressSequentially("3");
        await expect(error).toHaveCount(0);
        await expect(
            page.locator('[data-primitives-part="number-field-root"]'),
        ).toHaveAttribute("data-valid", "");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "guests=3");

        await typeOver(input, "12");
        await input.blur();
        await expect(input).toHaveValue("12");
        await expect(error).toBeVisible();
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "guests=3");
        await expect(input).toBeFocused();
    });
});

test.describe("number-field / commit", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/number-field/commit");
    });

    /** The last commit the scenario printed, and how many there were. */
    async function expectCommit(
        page: Page,
        value: string,
        reason: string,
        count: number,
    ) {
        await expectOutput(page, "committed", value);
        await expectOutput(page, "commitReason", reason);
        await expectOutput(page, "commits", String(count));
    }

    test("typing commits once, on blur; a key step commits at once", async ({
        page,
    }) => {
        const input = spin(page, "Amount");
        await typeOver(input, "120");
        await expectChange(page, "120", "input-change");
        await expectOutput(page, "commits", "0");
        await input.press("Tab");
        await expectChange(page, "100", "input-blur");
        await expectCommit(page, "100", "input-blur", 1);
        await typeOver(input, "7");
        await input.press("ArrowUp");
        await expectCommit(page, "8", "keyboard", 2);
        // a blur with nothing typed since commits nothing
        await input.press("Tab");
        await expectOutput(page, "commits", "2");
        await input.focus();
        await input.press("End");
        await expectCommit(page, "100", "keyboard", 3);
        // a step at a bound changes nothing and commits nothing
        await input.press("ArrowUp");
        await expectOutput(page, "commits", "3");
    });

    test("a button press commits once, at its release, after a held repeat too", async ({
        page,
    }) => {
        const increase = page.getByRole("button", { name: "Increase" });
        await increase.click();
        await expectCommit(page, "51", "increment-press", 1);
        await page.getByRole("button", { name: "Decrease" }).hover();
        await page.mouse.down();
        await expect
            .poll(async () =>
                Number(
                    await spin(page, "Amount").getAttribute("aria-valuenow"),
                ),
            )
            .toBeLessThan(48);
        await expectOutput(page, "commits", "1");
        await page.mouse.up();
        const value = await spin(page, "Amount").getAttribute("aria-valuenow");
        await expectCommit(page, value ?? "", "decrement-press", 2);
    });

    test("a form reset commits nothing", async ({ page }) => {
        const input = spin(page, "Amount");
        await input.focus();
        await input.press("ArrowUp");
        await expectCommit(page, "51", "keyboard", 1);
        await page.getByRole("button", { name: "Reset" }).click();
        await expectChange(page, "50", "none");
        await expectOutput(page, "commits", "1");
    });
});
