import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/month-calendar.md, "Views": the Trigger named by the calendar root it sits in
test("calendar-view / picker: the view Trigger and the views' parts", async ({
    page,
}) => {
    await openScenario(page, "/calendar-view/picker", { today: true });
    await part(page, "date-picker", "trigger").click();
    const trigger = part(page, "calendar", "view-trigger");
    await expect(trigger).toHaveAttribute("type", "button");
    await expect(trigger).toHaveAttribute("data-view", "day");
    await expect(part(page, "calendar", "preset")).toHaveCount(1);
    await trigger.click();
    await expect(part(page, "calendar", "view-trigger")).toHaveAttribute(
        "data-view",
        "month",
    );
    const popup = part(page, "date-picker", "popup");
    await expect(part(popup, "month-calendar", "cell")).toHaveCount(12);
    await part(page, "calendar", "view-trigger").click();
    const yearTrigger = part(page, "calendar", "view-trigger");
    await expect(yearTrigger).toHaveAttribute("data-view", "year");
    await expect(yearTrigger).toBeDisabled();
    await expect(yearTrigger).toHaveAttribute("data-disabled", "");
    await expect(part(popup, "year-calendar", "cell")).toHaveCount(12);
    await expectNoFalseStates(part(page, "calendar", "view-trigger"));
});
