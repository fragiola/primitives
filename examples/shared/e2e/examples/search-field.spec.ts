import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// search-field: a product search (spec/search-field.md). A `<search>` holding a `<label
// for="product-search">` "Search products", a controlled SearchField (a search icon, the Input
// with the placeholder "Lamps, desks…", a ClearButton "Clear search"), a list "Results" of the
// products whose name holds the query ("Desk lamp", "Floor lamp", "Standing desk", "Desk chair"
// when empty) and a status: empty, then "Searched for “<query>”." after Enter.

test("typing filters the list; Escape and the clear button empty the field", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "search-field" });
    const input = frame.getByRole("searchbox", { name: "Search products" });
    const results = frame.getByRole("list", { name: "Results" });
    await expect(frame.getByRole("search")).toBeVisible();
    await expect(results.getByRole("listitem")).toHaveCount(4);

    await input.fill("lamp");
    await expect(results.getByRole("listitem")).toHaveText([
        "Desk lamp",
        "Floor lamp",
    ]);
    await page.keyboard.press("Escape");
    await expect(input).toHaveValue("");
    await expect(input).toBeFocused();
    await expect(results.getByRole("listitem")).toHaveCount(4);

    await input.fill("desk");
    await expect(results.getByRole("listitem")).toHaveCount(3);
    await frame.getByRole("button", { name: "Clear search" }).click();
    await expect(input).toHaveValue("");
    await expect(input).toBeFocused();
    expect(errors).toEqual([]);
});

test("Enter searches for the query; the clear button is out of the tab order", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "search-field" });
    const input = frame.getByRole("searchbox", { name: "Search products" });
    await input.fill("chair");
    await page.keyboard.press("Enter");
    await expect(frame.getByRole("status")).toHaveText("Searched for “chair”.");
    await expect(
        frame.getByRole("button", { name: "Clear search" }),
    ).toHaveAttribute("tabindex", "-1");
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("search-field");
    await page.goto(`${EMBED_BASE}?id=search-field`);
    await expect(
        page.getByRole("searchbox", { name: "Search products" }),
    ).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
