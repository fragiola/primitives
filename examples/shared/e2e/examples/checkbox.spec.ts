import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// checkbox: pizza toppings, a CheckboxGroup with a parent checkbox (spec/checkbox.md).

test("the parent checks or clears every topping, and is mixed in between", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "checkbox" });
    const group = frame.getByRole("group", { name: "Toppings" });
    await expect(group).toHaveAttribute(
        "data-primitives-part",
        "checkbox-group-root",
    );
    const box = (name: string) => frame.getByRole("checkbox", { name });
    const parent = box("All toppings");
    await expect(parent).toHaveAttribute("aria-checked", "mixed");
    await expect(box("Cheese")).toHaveAttribute("aria-checked", "true");

    await parent.click();
    for (const name of ["All toppings", "Cheese", "Ham", "Pineapple"]) {
        await expect(box(name)).toHaveAttribute("aria-checked", "true");
    }
    await parent.click();
    for (const name of ["All toppings", "Cheese", "Ham", "Pineapple"]) {
        await expect(box(name)).toHaveAttribute("aria-checked", "false");
    }

    // Space toggles the focused checkbox; a click on the label too
    await box("Ham").focus();
    await page.keyboard.press("Space");
    await expect(box("Ham")).toHaveAttribute("aria-checked", "true");
    await expect(parent).toHaveAttribute("aria-checked", "mixed");
    await frame.getByText("Pineapple").click();
    await expect(box("Pineapple")).toHaveAttribute("aria-checked", "true");
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("checkbox");
    await page.goto(`${EMBED_BASE}?id=checkbox`);
    await expect(page.getByRole("checkbox")).toHaveCount(4);
    expect(await axeViolations(page)).toEqual([]);
});
