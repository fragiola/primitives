import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// number-field: a quantity field (spec/number-field.md). A NumberField "Quantity" (a Label) from
// 1 to 10 at 1 with "Decrease" and "Increase"; a NumberField "Discount" at 10% whose Label sits in
// a scrub area.

test("the buttons, the keys and typing change the quantity", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "number-field" });
    const quantity = frame.getByRole("spinbutton", { name: "Quantity" });
    await expect(quantity).toHaveAttribute(
        "data-primitives-part",
        "number-field-input",
    );
    await expect(quantity).toHaveAttribute("aria-valuenow", "1");
    await expect(
        frame.getByRole("button", { name: "Decrease" }),
    ).toBeDisabled();
    await frame.getByRole("button", { name: "Increase" }).click();
    await expect(quantity).toHaveAttribute("aria-valuenow", "2");
    await quantity.focus();
    await quantity.press("PageUp");
    await expect(quantity).toHaveAttribute("aria-valuenow", "10");
    await expect(
        frame.getByRole("button", { name: "Increase" }),
    ).toBeDisabled();
    await quantity.press("Home");
    await expect(quantity).toHaveAttribute("aria-valuenow", "1");
    await quantity.fill("7");
    await expect(quantity).toHaveAttribute("aria-valuenow", "7");

    const discount = frame.getByRole("spinbutton", { name: "Discount" });
    await expect(discount).toHaveValue("10%");
    await discount.focus();
    await discount.press("ArrowUp");
    await expect(discount).toHaveValue("11%");
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("number-field");
    await page.goto(`${EMBED_BASE}?id=number-field`);
    await expect(page.getByRole("spinbutton")).toHaveCount(2);
    expect(await axeViolations(page)).toEqual([]);
});
