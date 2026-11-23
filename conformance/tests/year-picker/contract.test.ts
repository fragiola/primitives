import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/month-calendar.md: the year pickers' parts
test("year-picker / form: the pickers' and their calendars' parts", async ({
    page,
}) => {
    await openScenario(page, "/year-picker/form", { today: true });
    await expect(part(page, "year-picker", "trigger")).toHaveCount(1);
    await expect(part(page, "year-range-picker", "trigger")).toHaveCount(1);
    await expect(part(page, "year-picker", "input")).toHaveAttribute(
        "name",
        "year",
    );
    await part(page, "year-picker", "trigger").click();
    await expect(part(page, "year-calendar", "cell")).toHaveCount(12);
    await expectNoFalseStates(parts(page, "year-picker"));
    await page.keyboard.press("Escape");
    await part(page, "year-range-picker", "trigger").click();
    await expect(part(page, "year-range-calendar", "grid")).toHaveAttribute(
        "aria-multiselectable",
        "true",
    );
});
