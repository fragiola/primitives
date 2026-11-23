import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// steps: a checkout stepper (spec/steps.md). A linear Steps "Checkout" of Shipping (a "Full name"
// field it needs), Payment and Review, Back and Continue, and "Order placed" once done.

test("the steps wait for the shipping name, then place the order", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "steps" });
    const button = (name: string) =>
        frame.getByRole("button", { name, exact: true });
    const list = frame.getByRole("list", { name: "Checkout" });
    await expect(list.getByRole("listitem").first()).toHaveAttribute(
        "aria-current",
        "step",
    );
    await expect(button("Continue")).toBeDisabled();
    await expect(button("Payment")).toBeDisabled();
    await frame
        .getByRole("textbox", { name: "Full name" })
        .fill("Ada Lovelace");
    await expect(button("Continue")).toBeEnabled();
    await button("Continue").click();
    await expect(button("Payment")).toHaveAttribute("aria-current", "step");
    await button("Review").click();
    await expect(button("Review")).toHaveAttribute("aria-current", "step");
    await expect(frame.getByText("Ada Lovelace")).toBeVisible();
    await button("Continue").click();
    await expect(frame.getByText("Order placed")).toBeVisible();
    await expect(button("Continue")).toBeDisabled();
    await button("Back").click();
    await expect(button("Review")).toHaveAttribute("aria-current", "step");
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("steps");
    await page.goto(`${EMBED_BASE}?id=steps`);
    await expect(page.getByRole("list", { name: "Checkout" })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
