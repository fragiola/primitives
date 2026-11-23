import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("rating / basic: four stars, focused", async ({ page }) => {
    await openScenario(page, "/rating/basic");
    const four = page.getByRole("radio", { name: "4 stars", exact: true });
    await page.getByRole("radio", { name: "1 star", exact: true }).focus();
    // from no value, the first step is the first star
    for (let step = 0; step < 4; step++) {
        await page.keyboard.press("ArrowRight");
    }
    await expect(four).toHaveAttribute("aria-checked", "true");
    await expectScreen(page, "rating-basic-checked");
});

test("rating / half: a half star", async ({ page }) => {
    await openScenario(page, "/rating/half");
    await expect(
        page.getByRole("radio", { name: "2.5 stars", exact: true }),
    ).toHaveAttribute("data-half", "");
    await expectScreen(page, "rating-half");
});

test("rating / half in RTL", async ({ page }) => {
    await openScenario(page, "/rating/half", { dir: "rtl" });
    await expect(
        page.getByRole("radio", { name: "2.5 stars", exact: true }),
    ).toHaveAttribute("data-half", "");
    await expectScreen(page, "rating-half-rtl");
});

test("rating / read-only and disabled", async ({ page }) => {
    await openScenario(page, "/rating/read-only");
    await expectScreen(page, "rating-read-only");
});
