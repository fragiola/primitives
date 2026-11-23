import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/month-calendar.md: the pickers' parts are the DatePicker's, named by their root
test("month-picker / form: the pickers' and their calendars' parts", async ({
    page,
}) => {
    await openScenario(page, "/month-picker/form", { today: true });
    await expect(parts(page, "date-picker")).toHaveCount(0);
    const trigger = part(page, "month-picker", "trigger");
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await expect(part(page, "month-range-picker", "trigger")).toHaveCount(1);
    const input = part(page, "month-picker", "input");
    await expect(input).toHaveAttribute("name", "expiry");
    await expect(input).toHaveAttribute("aria-hidden", "true");
    await expect(part(page, "month-range-picker", "input")).toHaveAttribute(
        "name",
        "period",
    );
    await trigger.click();
    await expect(part(page, "month-picker", "popup")).toHaveAttribute(
        "data-open",
        "",
    );
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    await expect(part(page, "month-calendar", "cell")).toHaveCount(12);
    await expectNoFalseStates(parts(page, "month-picker"));
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("2026-11");
    await part(page, "month-range-picker", "trigger").click();
    await expect(part(page, "month-range-calendar", "cell")).toHaveCount(12);
});
