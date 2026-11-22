import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
    collectErrors,
    EMBED_BASE,
    openHosted,
    promoted,
    requireExamples,
    WCAG,
} from "../helpers.ts";

// combobox: fruit tags, a multiple combobox with chips (spec/combobox.md, D10). Non-modal: never
// promoted.

test("typing filters, Enter adds a chip, Backspace removes the last one", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "combobox" });
    const input = frame.getByRole("combobox", { name: "Fruits" });
    await expect(input).toHaveAttribute(
        "data-primitives-part",
        "combobox-input",
    );
    const chips = frame.locator('[data-primitives-part="combobox-chip"]');
    await expect(chips).toHaveText(["Apple×"]);

    // a press on the input opens the list
    await input.click();
    const listbox = frame.getByRole("listbox");
    await expect(listbox).toBeVisible();
    await expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    expect(await promoted(page)).toBe(false);

    await page.keyboard.type("bl");
    await expect(frame.getByRole("option")).toHaveText(["Blueberry"]);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(chips).toHaveText(["Apple×", "Blueberry×"]);
    await expect(input).toHaveValue("");

    await page.keyboard.press("Backspace");
    await expect(chips).toHaveText(["Apple×"]);

    // Escape resets the text
    await page.keyboard.type("xyz");
    await expect(frame.getByText("No fruit found.")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(input).toHaveValue("");
    expect(errors).toEqual([]);
});

test("a chip's remove button removes it and keeps focus in the input", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "combobox" });
    await frame.getByRole("button", { name: "Remove Apple" }).click();
    await expect(
        frame.locator('[data-primitives-part="combobox-chip"]'),
    ).toHaveCount(0);
    await expect(frame.getByRole("combobox", { name: "Fruits" })).toBeFocused();
});

test("axe finds no violation with the list open", async ({ page }) => {
    requireExamples("combobox");
    await page.goto(`${EMBED_BASE}?id=combobox`);
    await page.getByRole("combobox", { name: "Fruits" }).click();
    await expect(page.getByRole("listbox")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(results.violations).toEqual([]);
});
