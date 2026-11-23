import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/calendar.md, "Presets": a button named by the root it sits in
test("calendar-preset / basic: buttons, data-selected and data-disabled", async ({
    page,
}) => {
    await openScenario(page, "/calendar-preset/basic", { today: true });
    const dates = part(page, "calendar", "preset");
    const ranges = part(page, "range-calendar", "preset");
    await expect(dates).toHaveCount(3);
    await expect(ranges).toHaveCount(2);
    await expect(dates.first()).toHaveAttribute("type", "button");
    await expect(dates.nth(2)).toHaveAttribute("data-disabled", "");
    await ranges.first().click();
    await expect(ranges.first()).toHaveAttribute("data-selected", "");
    await expect(ranges.nth(1)).not.toHaveAttribute("data-selected");
    await expectNoFalseStates(dates);
    await expectNoFalseStates(ranges);
});

test("calendar-preset / picker: the preset of the current range is selected", async ({
    page,
}) => {
    await openScenario(page, "/calendar-preset/picker", { today: true });
    await part(page, "date-range-picker", "trigger").click();
    await part(page, "range-calendar", "preset").nth(1).click();
    await part(page, "date-range-picker", "trigger").click();
    const presets = part(page, "range-calendar", "preset");
    await expect(presets.nth(1)).toHaveAttribute("data-selected", "");
    await expect(presets.first()).not.toHaveAttribute("data-selected");
});
