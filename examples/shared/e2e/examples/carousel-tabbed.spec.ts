import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// carousel-tabbed: a tabbed feature carousel (spec/carousel.md). A Carousel "Feature tour" of
// three slides ("1 of 3", ...: "Sync everywhere", "Share with anyone", "Secure by default")
// picked from a tablist "Choose slide to display" of the tabs "Sync", "Share" and "Secure".

test("the tabs pick the slides, with the arrow keys too", async ({ page }) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "carousel-tabbed" });
    const carousel = frame.getByRole("region", { name: "Feature tour" });
    const tab = (name: string) =>
        carousel.getByRole("tab", { name, exact: true });
    const panel = (name: string) =>
        carousel.getByRole("tabpanel", { name, exact: true });
    await expect(tab("Sync")).toHaveAttribute("aria-selected", "true");
    await expect(panel("1 of 3")).toContainText("Sync everywhere");
    await tab("Sync").focus();
    await page.keyboard.press("ArrowRight");
    await expect(tab("Share")).toBeFocused();
    await expect(tab("Share")).toHaveAttribute("aria-selected", "true");
    await expect(panel("2 of 3")).toContainText("Share with anyone");
    await page.keyboard.press("End");
    await expect(panel("3 of 3")).toContainText("Secure by default");
    await tab("Sync").click();
    await expect(panel("1 of 3")).toBeVisible();
    await expect(carousel.getByRole("tabpanel")).toHaveCount(1);
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("carousel-tabbed");
    await page.goto(`${EMBED_BASE}?id=carousel-tabbed`);
    await expect(
        page.getByRole("region", { name: "Feature tour" }),
    ).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
