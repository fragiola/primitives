import { expect, test } from "@playwright/test";
import { SYSTEM_LOCALES, systemPath } from "../../src/calendar-systems.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

const system = (locale: string) => locale.split("-u-ca-")[1] ?? locale;

for (const { locale, rtl } of SYSTEM_LOCALES) {
    test(`${systemPath("basic", locale, rtl)}`, async ({ page }) => {
        await page.clock.setFixedTime(new Date(2026, 10, 20, 10, 0, 0));
        await page.goto(systemPath("basic", locale, rtl));
        await expect(page.getByRole("spinbutton").first()).toBeVisible();
        await expectScreen(page, `calendar-systems-basic-${system(locale)}`);
    });

    test(`${systemPath("pickers", locale, rtl)}: the date picker open`, async ({
        page,
    }) => {
        await page.clock.setFixedTime(new Date(2026, 10, 20, 10, 0, 0));
        await page.goto(systemPath("pickers", locale, rtl));
        await page.getByRole("button", { name: "Date Choose date" }).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await expectScreen(page, `calendar-systems-pickers-${system(locale)}`);
    });
}
