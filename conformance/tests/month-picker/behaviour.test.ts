import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { monthHeading, yearName } from "../../src/dates.ts";
import { expectFocusWithin } from "../../src/focus.ts";
import { expectSubmitted, resetForm } from "../../src/form.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/month-calendar.md, `/month-picker/form`: today is fixed at 2026-11-20; en-US

const month = (page: Page, year: number, value: number) =>
    page.getByRole("gridcell", {
        name: monthHeading("en-US", year, value),
        exact: true,
    });

test("month-picker / form: choose, submit, reset", async ({ page }) => {
    await openScenario(page, "/month-picker/form", { today: true });
    const expiry = page.getByRole("button", { name: /^Expiry: / });
    const period = page.getByRole("button", { name: /^Period: / });
    const submit = page.getByRole("button", { name: "Submit" });
    await submit.click();
    await expectSubmitted(page, "none");
    await expect(expiry).toBeFocused();

    await expiry.click();
    const dialog = page.getByRole("dialog", { name: "Choose month" });
    await expect(dialog).toBeVisible();
    await expect(
        dialog.getByRole("grid", {
            name: yearName("en-US", 2026),
            exact: true,
        }),
    ).toBeVisible();
    await expectFocusWithin(month(page, 2026, 11));
    await expect(month(page, 2026, 10)).toHaveAttribute(
        "aria-disabled",
        "true",
    );
    await expectNoAxeViolations(page);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(expiry).toBeFocused();
    await expect(expiry).toHaveText("Expiry: 2026-12");

    await period.click();
    await month(page, 2026, 3).click();
    await expect(
        page.getByRole("dialog", { name: "Choose months" }),
    ).toBeVisible();
    await month(page, 2026, 6).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(period).toHaveText("Period: 2026-03..2026-06");

    await submit.click();
    await expectSubmitted(page, "expiry=2026-12&period=2026-03/2026-06");

    await expiry.click();
    await expectFocusWithin(month(page, 2026, 12));
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(expiry).toBeFocused();

    await resetForm(page);
    await expect(expiry).toHaveText("Expiry: none");
    await expect(period).toHaveText("Period: none");
});
