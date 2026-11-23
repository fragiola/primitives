import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/time-zones.md: the zone segment is a part with its type and no role; the zoned values'
// hidden inputs are text inputs holding the zoned ISO text
test("time-zones / field: the zone segment and the hidden inputs", async ({
    page,
}) => {
    await openScenario(page, "/time-zones/field", { today: true });
    const zone = page.locator('[data-type="timeZoneName"]').first();
    await expect(zone).toHaveAttribute(
        "data-primitives-part",
        "date-field-segment",
    );
    await expect(zone).not.toHaveAttribute("role", /.+/);
    const hidden = part(page, "date-field", "hidden-input").first();
    await expect(hidden).toHaveAttribute("type", "text");
    await expect(hidden).toHaveValue(
        "2026-11-01T01:30-04:00[America/New_York]",
    );
    await expect(part(page, "date-range-field", "hidden-input")).toHaveCount(2);
    await expectNoFalseStates(parts(page, "date-field"));
    await expectNoFalseStates(parts(page, "date-range-field"));
});

test("time-zones / picker: the typed picker's zoned form value", async ({
    page,
}) => {
    await openScenario(page, "/time-zones/picker", { today: true });
    await expect(part(page, "date-picker", "input")).toHaveValue(
        "2026-03-07T02:30-05:00[America/New_York]",
    );
    await expect(
        part(page, "date-picker", "segments").locator(
            '[data-type="timeZoneName"]',
        ),
    ).toHaveCount(1);
});
