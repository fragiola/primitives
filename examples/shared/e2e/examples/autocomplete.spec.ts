import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    promoted,
    requireExamples,
} from "../helpers.ts";

// autocomplete: a search with suggestions (spec/autocomplete.md). Non-modal: never promoted.

test("suggestions follow the text; a suggestion or free text is searched", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "autocomplete" });
    const input = frame.getByRole("combobox", { name: "Search frameworks" });
    await expect(input).toHaveAttribute(
        "data-primitives-part",
        "autocomplete-input",
    );
    await input.click();
    await page.keyboard.type("re");
    await expect(frame.getByRole("option")).toHaveText([
        "Preact",
        "React",
        "Remix",
    ]);
    expect(await promoted(page)).toBe(false);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("React");
    await expect(frame.getByRole("listbox")).toHaveCount(0);
    // the list is closed: Enter submits the search
    await page.keyboard.press("Enter");
    await expect(frame.getByText("Results for “React”")).toBeVisible();

    await input.press("ControlOrMeta+a");
    await page.keyboard.type("htmx");
    await expect(frame.getByText("No suggestion.")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(frame.getByText("Results for “htmx”")).toBeVisible();
    await frame.getByRole("button", { name: "Clear search" }).click();
    await expect(input).toHaveValue("");
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("autocomplete");
    await page.goto(`${EMBED_BASE}?id=autocomplete`);
    const input = page.getByRole("combobox", { name: "Search frameworks" });
    await input.click();
    await page.keyboard.type("s");
    await expect(page.getByRole("option").first()).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
