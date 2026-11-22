import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// slider: a volume and a price range (spec/slider.md), each named by its Slider.Label ("Volume",
// "Price") and showing its Slider.Value; the price is formatted as US dollars (`format`,
// `locale="en-US"`), which also gives the thumbs their `aria-valuetext`.

test("the keyboard steps and jumps; the range thumbs stay ten apart", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "slider" });
    const volume = frame.getByRole("slider", { name: "Volume" });
    await expect(volume).toHaveAttribute(
        "data-primitives-part",
        "slider-thumb",
    );
    await expect(volume).toHaveAttribute("aria-valuenow", "50");
    const values = frame.locator('[data-primitives-part="slider-value"]');
    await expect(values.nth(0)).toHaveText("50");
    await volume.focus();
    await page.keyboard.press("ArrowRight");
    await expect(volume).toHaveAttribute("aria-valuenow", "51");
    await expect(values.nth(0)).toHaveText("51");
    await page.keyboard.press("PageDown");
    await expect(volume).toHaveAttribute("aria-valuenow", "41");
    await page.keyboard.press("End");
    await expect(volume).toHaveAttribute("aria-valuenow", "100");

    const min = frame.getByRole("slider", { name: "Minimum price" });
    const max = frame.getByRole("slider", { name: "Maximum price" });
    await expect(frame.getByRole("group", { name: "Price" })).toBeVisible();
    await expect(min).toHaveAttribute("aria-valuetext", "$20");
    await expect(values.nth(1)).toHaveText("$20 – $80");
    await min.focus();
    await page.keyboard.press("End");
    await expect(min).toHaveAttribute("aria-valuenow", "70");
    await expect(min).toHaveAttribute("aria-valuetext", "$70");
    await expect(values.nth(1)).toHaveText("$70 – $80");
    await max.focus();
    await page.keyboard.press("Home");
    await expect(max).toHaveAttribute("aria-valuenow", "80");
    expect(errors).toEqual([]);
});

test("a press on the track moves the nearest thumb", async ({ page }) => {
    const frame = await openHosted(page, { id: "slider" });
    const volume = frame.getByRole("slider", { name: "Volume" });
    const control = frame.locator('[data-primitives-part="slider-control"]');
    const box = await control.first().boundingBox();
    expect(box).not.toBeNull();
    const { x, y, width, height } = box as NonNullable<typeof box>;
    await page.mouse.click(
        Math.round(x + width * 0.25),
        Math.round(y + height / 2),
    );
    await expect(volume).toHaveAttribute("aria-valuenow", "25");
    await expect(volume).toBeFocused();
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("slider");
    await page.goto(`${EMBED_BASE}?id=slider`);
    await expect(page.getByRole("slider")).toHaveCount(3);
    expect(await axeViolations(page)).toEqual([]);
});
