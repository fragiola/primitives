import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// carousel: an image carousel (spec/carousel.md). A Carousel "Featured destinations" of four photo
// slides ("1 of 4", ...), rotating at first; its rotation control first ("Stop slide rotation" /
// "Start slide rotation"), Previous and Next that loop, and four Indicators "Slide 1" to "Slide 4"
// in a group "Choose slide to display".

test("the rotation control, the triggers and the dots", async ({ page }) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "carousel" });
    const carousel = frame.getByRole("region", {
        name: "Featured destinations",
    });
    const button = (name: string) =>
        carousel.getByRole("button", { name, exact: true });
    const slide = (name: string) =>
        carousel.getByRole("group", { name, exact: true });
    // a press on the rotation control stops it (its label follows)
    await button("Stop slide rotation").click();
    await expect(button("Start slide rotation")).toBeVisible();
    await button("Slide 1").click({ force: true });
    await expect(slide("1 of 4")).toBeVisible();
    await button("Next slide").click();
    await expect(slide("2 of 4")).toBeVisible();
    await expect(slide("1 of 4")).toHaveCount(0);
    await button("Slide 4").click();
    await expect(slide("4 of 4")).toBeVisible();
    await expect(button("Slide 4")).toHaveAttribute("aria-disabled", "true");
    await button("Next slide").click();
    await expect(slide("1 of 4")).toBeVisible();
    // started again, focus entering the carousel from outside it stops it
    await button("Start slide rotation").click();
    await expect(button("Stop slide rotation")).toBeVisible();
    await button("Stop slide rotation").blur();
    await button("Next slide").focus();
    await expect(button("Start slide rotation")).toBeVisible();
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("carousel");
    await page.goto(`${EMBED_BASE}?id=carousel`);
    await expect(
        page.getByRole("region", { name: "Featured destinations" }),
    ).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
