import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";
import { typeKeys } from "../../src/segments.ts";

// spec/calendar.md, "Typed input": the picker's parts and the typed segments' (`-segments`,
// `-segment`), the picker's own hidden input; no DateField part
test("date-picker-input / basic: the picker's parts and the typed segments'", async ({
    page,
}) => {
    await openScenario(page, "/date-picker-input/basic", { today: true });
    await expect(parts(page, "date-field")).toHaveCount(0);
    const group = part(page, "date-picker", "segments");
    await expect(group).toHaveCount(1);
    await expect(group).toHaveAttribute("role", "group");
    await expect(part(group, "date-picker", "segment")).toHaveCount(5);
    await expect(part(page, "date-picker", "trigger")).toHaveCount(1);
    const hidden = part(page, "date-picker", "input");
    await expect(hidden).toHaveCount(1);
    await expect(hidden).toHaveAttribute("aria-hidden", "true");
    await expect(hidden).toHaveAttribute("name", "arrival");
    await expect(hidden).toHaveValue("");
    await group.locator('[role="spinbutton"]').first().focus();
    await typeKeys(page, "11242026");
    await expect(hidden).toHaveValue("2026-11-24");
    await expectNoFalseStates(parts(page, "date-picker"));
});

test("date-picker-input / range: two ends, the range calendar's parts", async ({
    page,
}) => {
    await openScenario(page, "/date-picker-input/range", { today: true });
    const groups = part(page, "date-range-picker", "segments");
    await expect(groups).toHaveCount(2);
    await expect(groups.nth(0)).toHaveAttribute("data-range", "start");
    await expect(groups.nth(1)).toHaveAttribute("data-range", "end");
    await expect(part(page, "date-range-picker", "segment")).toHaveCount(10);
    await part(page, "date-range-picker", "trigger").click();
    await expect(part(page, "range-calendar", "root")).toHaveCount(1);
    await expect(parts(page, "calendar")).toHaveCount(0);
    await expectNoFalseStates(parts(page, "date-range-picker"));
});
