import { test } from "@playwright/test";
import { monthHeading } from "../../src/dates.ts";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("calendar-view / picker: the day and month views", async ({ page }) => {
    await openScenario(page, "/calendar-view/picker", { today: true });
    await page.getByRole("button", { name: /^Choose date: / }).click();
    await page.getByRole("dialog").waitFor();
    await expectScreen(page, "calendar-view-day");
    await page
        .getByRole("button", {
            name: monthHeading("en-US", 2026, 11),
            exact: true,
        })
        .click();
    await page.getByRole("grid", { name: "2026" }).waitFor();
    await expectScreen(page, "calendar-view-month");
});
