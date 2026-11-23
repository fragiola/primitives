import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";
import { dayPeriods, typeKeys } from "../../src/segments.ts";

// spec/date-range-field.md: TimeRangeField's parts are time-range-field-*
test("time-range-field / basic: every part carries time-range-field-*", async ({
    page,
}) => {
    await openScenario(page, "/time-range-field/basic", { today: true });
    await expect(parts(page, "date-range-field")).toHaveCount(0);
    await expect(parts(page, "date-field")).toHaveCount(0);
    const root = part(page, "time-range-field", "root");
    await expect(part(root, "time-range-field", "input")).toHaveCount(2);
    const hidden = part(page, "time-range-field", "hidden-input");
    await expect(hidden).toHaveCount(2);
    await expect(hidden.nth(0)).toHaveAttribute("type", "time");
    const [am, pm] = await dayPeriods(page, "en-US");
    await root.locator('[role="spinbutton"]').first().focus();
    await typeKeys(page, "900");
    await page.keyboard.press(am.charAt(0).toLowerCase());
    await typeKeys(page, "500");
    await page.keyboard.press(pm.charAt(0).toLowerCase());
    await expect(hidden.nth(0)).toHaveValue("09:00");
    await expect(hidden.nth(1)).toHaveValue("17:00");
    await expect(hidden.nth(0)).toHaveAttribute("max", "17:00");
    await expect(hidden.nth(1)).toHaveAttribute("min", "09:00");
    await expectNoFalseStates(parts(page, "time-range-field"));
});
