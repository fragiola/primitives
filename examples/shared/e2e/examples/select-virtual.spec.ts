import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    promoted,
    requireExamples,
} from "../helpers.ts";

// select-virtual: a country list of thousands (spec/virtual-lists.md). A Select over 5 000
// countries, "Aldabria" … "Zanuzia" in alphabetical order, whose SelectVirtual List renders only
// the rows in view. Non-modal: never promoted.

test("the keys and the typeahead reach every country, rendered or not", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "select-virtual" });
    const trigger = frame.getByRole("combobox", { name: "Country" });
    await expect(trigger).toHaveAttribute(
        "data-primitives-part",
        "select-trigger",
    );
    await expect(trigger).toHaveText("Choose a country");
    await trigger.click();
    const listbox = frame.getByRole("listbox");
    await expect(listbox).toHaveAttribute(
        "data-primitives-part",
        "select-list",
    );
    expect(await promoted(page)).toBe(false);
    const options = frame.getByRole("option");
    const first = options.first();
    await expect(first).toHaveText("Aldabria");
    await expect(first).toHaveAttribute("aria-setsize", "5000");
    await expect(first).toHaveAttribute("aria-posinset", "1");
    // a few dozen rows in the DOM, not 5 000
    expect(await options.count()).toBeLessThan(60);

    // End highlights the last country, rendered for it and named by the trigger
    await page.keyboard.press("End");
    const highlighted = frame.locator('[role="option"][data-highlighted]');
    await expect(highlighted).toHaveText("Zanuzia");
    await expect(highlighted).toHaveAttribute("aria-posinset", "5000");
    await expect(highlighted).toBeInViewport();
    await expect(trigger).toHaveAttribute(
        "aria-activedescendant",
        (await highlighted.getAttribute("id")) as string,
    );

    // the typeahead reaches a country far from the rows in view; Enter chooses it
    await page.keyboard.type("nor");
    await expect(highlighted).toHaveText("Norabria");
    await expect(highlighted).toHaveAttribute("aria-posinset", "2601");
    await expect(highlighted).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(listbox).toHaveCount(0);
    await expect(trigger).toHaveText("Norabria");

    // opening again highlights the chosen country, in view
    await trigger.click();
    await expect(highlighted).toHaveText("Norabria✓");
    await expect(highlighted).toBeInViewport();
    expect(errors).toEqual([]);
});

test("axe finds no violation with the list open", async ({ page }) => {
    requireExamples("select-virtual");
    await page.goto(`${EMBED_BASE}?id=select-virtual`);
    await page.getByRole("combobox", { name: "Country" }).click();
    await expect(page.getByRole("option").first()).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
