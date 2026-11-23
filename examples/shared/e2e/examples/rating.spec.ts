import { expect, type Locator, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// rating: a product rating (spec/rating.md). Two Ratings of five stars, each named by a label
// (`aria-labelledby`): "Average rating", `readOnly`, `allowHalf`, `defaultValue` 4.5, then the note
// "From 128 reviews."; "Your rating", `allowClear`, starting at 0, then a status "Not rated yet."
// or "You rated it <n> stars." ("1 star"). Every star is named "1 star", "2 stars", ... "5 stars";
// the star that holds a half value by the value ("4.5 stars"). Each holds the recipe's star mark.

/** The stars of a Rating with `data-highlighted`, by their index. */
const highlighted = async (stars: Locator) =>
    stars.evaluateAll((elements) =>
        elements.flatMap((element, index) =>
            element.hasAttribute("data-highlighted") ? [index + 1] : [],
        ),
    );

test("the average is read-only, in half steps", async ({ page }) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "rating" });
    const average = frame.getByRole("radiogroup", { name: "Average rating" });
    const stars = average.getByRole("radio");
    await expect(average).toHaveAttribute(
        "data-primitives-part",
        "rating-root",
    );
    await expect(average).toHaveAttribute("aria-readonly", "true");
    await expect(stars).toHaveCount(5);
    const half = average.getByRole("radio", { name: "4.5 stars" });
    await expect(half).toHaveAttribute("aria-checked", "true");
    await expect(half).toHaveAttribute("data-half", "");
    await expect(half).toHaveAttribute("tabindex", "0");
    expect(await highlighted(stars)).toEqual([1, 2, 3, 4, 5]);
    await expect(average.locator("[data-half]")).toHaveCount(1);
    for (const element of await stars.all()) {
        await expect(element).toHaveAttribute("data-readonly", "");
    }

    // focusable, and nothing changes it: no key, no press, no preview
    await half.focus();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Home");
    await expect(half).toBeFocused();
    await average.getByRole("radio", { name: "1 star" }).click();
    await average.getByRole("radio", { name: "2 stars" }).hover();
    await expect(half).toHaveAttribute("aria-checked", "true");
    expect(await highlighted(stars)).toEqual([1, 2, 3, 4, 5]);
    expect(errors).toEqual([]);
});

test("the pointer previews a score, a press chooses it, the same press clears it", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "rating" });
    const score = frame.getByRole("radiogroup", { name: "Your rating" });
    const stars = score.getByRole("radio");
    const star = (name: string) => score.getByRole("radio", { name });
    const status = frame.getByRole("status");
    await expect(stars).toHaveCount(5);
    await expect(score.locator('[aria-checked="true"]')).toHaveCount(0);
    expect(await highlighted(stars)).toEqual([]);
    await expect(status).toHaveText("Not rated yet.");

    await star("3 stars").hover();
    await expect.poll(() => highlighted(stars)).toEqual([1, 2, 3]);
    await status.hover();
    await expect.poll(() => highlighted(stars)).toEqual([]);

    await star("4 stars").click();
    await expect(star("4 stars")).toHaveAttribute("aria-checked", "true");
    await expect(star("4 stars")).toBeFocused();
    await expect(status).toHaveText("You rated it 4 stars.");
    await status.hover();
    await expect.poll(() => highlighted(stars)).toEqual([1, 2, 3, 4]);

    await star("4 stars").click();
    await expect(score.locator('[aria-checked="true"]')).toHaveCount(0);
    await expect(status).toHaveText("Not rated yet.");
    await expect(star("4 stars")).toBeFocused();
});

test("the arrows, Home and End choose the score; one tab stop", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "rating" });
    const score = frame.getByRole("radiogroup", { name: "Your rating" });
    const star = (name: string) => score.getByRole("radio", { name });
    const status = frame.getByRole("status");
    await expect(score.locator('[tabindex="0"]')).toHaveCount(1);
    await expect(star("1 star")).toHaveAttribute("tabindex", "0");

    await star("1 star").focus();
    await page.keyboard.press("Space");
    await expect(star("1 star")).toHaveAttribute("aria-checked", "true");
    await expect(status).toHaveText("You rated it 1 star.");
    await page.keyboard.press("ArrowRight");
    await expect(star("2 stars")).toBeFocused();
    await expect(star("2 stars")).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("End");
    await expect(star("5 stars")).toBeFocused();
    await expect(status).toHaveText("You rated it 5 stars.");
    await page.keyboard.press("ArrowRight");
    await expect(star("1 star")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(star("5 stars")).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Home");
    await expect(star("1 star")).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("ArrowDown");
    await expect(star("2 stars")).toHaveAttribute("aria-checked", "true");
    await expect(score.locator('[aria-checked="true"]')).toHaveCount(1);
    await expect(star("2 stars")).toHaveAttribute("tabindex", "0");
    await expect(status).toHaveText("You rated it 2 stars.");
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("rating");
    await page.goto(`${EMBED_BASE}?id=rating`);
    await expect(page.getByRole("radiogroup").first()).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
