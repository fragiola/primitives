import { expect, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";
import {
    dayPeriods,
    fieldGroup,
    segment,
    spinbuttons,
    typeKeys,
} from "../../src/segments.ts";

// spec/date-range-field.md, TimeRangeField (en-US, a 12-hour clock)
test("time-range-field / basic: opening hours, the end before the start invalid", async ({
    page,
}) => {
    await openScenario(page, "/time-range-field/basic", { today: true });
    const root = page.locator('[data-primitives-part="time-range-field-root"]');
    const start = fieldGroup(page, "Opening hours Opens");
    const end = fieldGroup(page, "Opening hours Closes");
    await expect(spinbuttons(start)).toHaveCount(3);
    await expect(spinbuttons(end)).toHaveCount(3);
    await expect(segment(start, "hour")).toHaveAttribute("aria-valuemin", "1");
    await expect(segment(start, "hour")).toHaveAttribute("aria-valuemax", "12");
    const [am, pm] = await dayPeriods(page, "en-US");

    await segment(start, "hour").focus();
    await typeKeys(page, "900");
    await page.keyboard.press(am.charAt(0).toLowerCase());
    await expect(segment(end, "hour")).toBeFocused();
    await typeKeys(page, "500");
    await page.keyboard.press(pm.charAt(0).toLowerCase());
    await expectOutput(page, "value", "09:00..17:00");
    await expectOutput(page, "reason", "input-change");
    await expect(root).not.toHaveAttribute("data-invalid");

    await page.keyboard.press("ArrowUp");
    await expectOutput(page, "value", "09:00..05:00");
    await expectOutput(page, "reason", "keyboard");
    await expect(root).toHaveAttribute("data-invalid", "");
    await expect(segment(start, "hour")).toHaveAttribute(
        "aria-invalid",
        "true",
    );
    await expectNoAxeViolations(page);

    await page.keyboard.press("ArrowDown");
    await expectOutput(page, "value", "09:00..17:00");
    await expect(root).not.toHaveAttribute("data-invalid");
    await expectNoAxeViolations(page);
});
