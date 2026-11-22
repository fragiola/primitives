import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// fieldset: shipping and billing addresses (spec/fieldset.md). A native form: a Fieldset
// "Shipping address" (fields "Street", "City"), a Checkbox "Billing same as shipping" (checked at
// first), a Fieldset "Billing address" (fields "Billing street", "Billing city") disabled while the
// checkbox is checked, a "Save" button and a status "Saved: <entries>".

test("each fieldset is a group named by its legend; billing is disabled while it is the same", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "fieldset" });
    const shipping = frame.getByRole("group", { name: "Shipping address" });
    await expect(shipping).toHaveAttribute(
        "data-primitives-part",
        "fieldset-root",
    );
    const billing = frame.getByRole("group", { name: "Billing address" });
    await expect(billing).toHaveAttribute("data-disabled", "");
    await expect(
        frame.getByRole("textbox", { name: "Billing street" }),
    ).toBeDisabled();
    await expect(
        frame.getByRole("textbox", { name: "Billing city" }),
    ).toBeDisabled();

    await frame
        .getByRole("textbox", { name: "Street", exact: true })
        .fill("Main St");
    await frame
        .getByRole("textbox", { name: "City", exact: true })
        .fill("Lisbon");
    await frame.getByRole("button", { name: "Save" }).click();
    await expect(frame.getByRole("status")).toHaveText(
        "Saved: street=Main St&city=Lisbon&same=on",
    );

    await frame
        .getByRole("checkbox", { name: "Billing same as shipping" })
        .click();
    await expect(billing).not.toHaveAttribute("data-disabled");
    const billingStreet = frame.getByRole("textbox", {
        name: "Billing street",
    });
    await expect(billingStreet).toBeEnabled();
    await billingStreet.fill("Rua Augusta");
    await frame.getByRole("button", { name: "Save" }).click();
    await expect(frame.getByRole("status")).toHaveText(
        "Saved: street=Main St&city=Lisbon&billing-street=Rua Augusta&billing-city=",
    );
    expect(errors).toEqual([]);
});

test("axe finds no violation, disabled and enabled", async ({ page }) => {
    requireExamples("fieldset");
    await page.goto(`${EMBED_BASE}?id=fieldset`);
    await expect(
        page.getByRole("group", { name: "Billing address" }),
    ).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
    await page
        .getByRole("checkbox", { name: "Billing same as shipping" })
        .click();
    expect(await axeViolations(page)).toEqual([]);
});
