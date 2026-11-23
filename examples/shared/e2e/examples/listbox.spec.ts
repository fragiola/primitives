import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// listbox: a transfer list (spec/listbox.md). Two multiple Listboxes, "Available" and "Chosen"
// ("Cheese" at first), and the buttons "Add" and "Remove" that move the selected toppings.

test("select a range, move it, then move one back", async ({ page }) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "listbox" });
    const available = frame.getByRole("listbox", { name: "Available" });
    const chosen = frame.getByRole("listbox", { name: "Chosen" });
    await expect(available).toHaveAttribute(
        "data-primitives-part",
        "listbox-root",
    );
    await expect(available).toHaveAttribute("aria-multiselectable", "true");
    await expect(chosen.getByRole("option")).toHaveText(["Cheese"]);
    const add = frame.getByRole("button", { name: "Add" });
    await expect(add).toBeDisabled();

    // a press, then Shift and a press: the range from the first to the second
    await available.getByRole("option", { name: "Mushrooms" }).click();
    await available
        .getByRole("option", { name: "Onions" })
        .click({ modifiers: ["Shift"] });
    // each selected option shows its check (hidden from the accessibility tree)
    await expect(available.getByRole("option", { selected: true })).toHaveText([
        "Mushrooms✓",
        "Olives✓",
        "Onions✓",
    ]);
    await add.click();
    await expect(chosen.getByRole("option")).toHaveText([
        "Cheese",
        "Mushrooms",
        "Olives",
        "Onions",
    ]);
    await expect(available.getByRole("option")).toHaveText([
        "Peppers",
        "Pineapple",
        "Spinach",
    ]);

    // the keyboard: Space toggles in the chosen list, Remove moves it back
    await chosen.getByRole("option", { name: "Olives" }).focus();
    await page.keyboard.press("Space");
    await frame.getByRole("button", { name: "Remove" }).click();
    await expect(chosen.getByRole("option")).toHaveText([
        "Cheese",
        "Mushrooms",
        "Onions",
    ]);
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("listbox");
    await page.goto(`${EMBED_BASE}?id=listbox`);
    await expect(page.getByRole("listbox")).toHaveCount(2);
    expect(await axeViolations(page)).toEqual([]);
});
