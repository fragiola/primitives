import { expect, type Page, test } from "@playwright/test";
import { yearName } from "../../src/dates.ts";
import { expectFocusWithin } from "../../src/focus.ts";
import { expectSubmitted } from "../../src/form.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/month-calendar.md, `/year-picker/form`: today is fixed at 2026-11-20; en-US
const year = (page: Page, value: number) =>
    page.getByRole("gridcell", { name: yearName("en-US", value), exact: true });

test("year-picker / form: a year and a range of years", async ({ page }) => {
    await openScenario(page, "/year-picker/form", { today: true });
    const single = page.getByRole("button", { name: /^Year: / });
    const range = page.getByRole("button", { name: /^Years: / });
    await single.click();
    await expect(
        page.getByRole("dialog", { name: "Choose year" }),
    ).toBeVisible();
    await expectFocusWithin(year(page, 2026));
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(single).toHaveText("Year: 2027");
    await expect(single).toBeFocused();

    await range.click();
    await year(page, 2024).click();
    await year(page, 2020).click();
    await expect(range).toHaveText("Years: 2020..2024");

    await page.getByRole("button", { name: "Submit" }).click();
    await expectSubmitted(page, "year=2027&years=2020/2024");
});
