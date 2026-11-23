import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("carousel / basic", async ({ page }) => {
    await openScenario(page, "/carousel/basic");
    await expect(
        page.getByRole("group", { name: "1 of 4", exact: true }),
    ).toBeVisible();
    await expectScreen(page, "carousel-basic");
});

test("carousel / basic, on the second page", async ({ page }) => {
    await openScenario(page, "/carousel/basic");
    await page.getByRole("button", { name: "Slide 2", exact: true }).click();
    const group = page.getByRole("group", { name: "2 of 4", exact: true });
    await expect
        .poll(() =>
            group
                .locator("..")
                .evaluate((element) => Math.round(element.scrollLeft)),
        )
        .toBe(320);
    await expectScreen(page, "carousel-basic-second");
});

test("carousel / basic, right to left", async ({ page }) => {
    await openScenario(page, "/carousel/basic", { dir: "rtl" });
    await expect(
        page.getByRole("group", { name: "1 of 4", exact: true }),
    ).toBeVisible();
    await expectScreen(page, "carousel-basic-rtl");
});

test("carousel / tabbed", async ({ page }) => {
    await openScenario(page, "/carousel/tabbed");
    await expect(
        page.getByRole("tab", { name: "Slide 1", exact: true }),
    ).toHaveAttribute("aria-selected", "true");
    await expectScreen(page, "carousel-tabbed");
});

test("carousel / multiple", async ({ page }) => {
    await openScenario(page, "/carousel/multiple");
    await expect(
        page.getByRole("group", { name: "2 of 5", exact: true }),
    ).toBeVisible();
    await expectScreen(page, "carousel-multiple");
});

test("carousel / vertical", async ({ page }) => {
    await openScenario(page, "/carousel/vertical");
    await expect(
        page.getByRole("group", { name: "1 of 3", exact: true }),
    ).toBeVisible();
    await expectScreen(page, "carousel-vertical");
});
