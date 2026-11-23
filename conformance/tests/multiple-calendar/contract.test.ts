import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { fullDate } from "../../src/dates.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/calendar.md, "Multiple dates": the Calendar's parts named by the MultipleCalendar's root
const cellOf = (page: import("@playwright/test").Page, day: number) =>
    page.locator(
        `[data-primitives-part="multiple-calendar-cell"][aria-label="${fullDate("en-US", 2026, 11, day)}"]`,
    );

test("multiple-calendar / basic: the Calendar's parts, named multiple-calendar-*", async ({
    page,
}) => {
    await openScenario(page, "/multiple-calendar/basic", { today: true });
    await expect(parts(page, "calendar")).toHaveCount(0);
    for (const name of [
        "root",
        "heading",
        "prev-button",
        "next-button",
        "grid",
        "grid-header",
        "grid-body",
    ]) {
        await expect(part(page, "multiple-calendar", name)).toHaveCount(1);
    }
    await expect(part(page, "multiple-calendar", "row")).toHaveCount(6);
    await expect(part(page, "multiple-calendar", "cell")).toHaveCount(42);
    await expect(part(page, "multiple-calendar", "grid")).toHaveAttribute(
        "aria-multiselectable",
        "true",
    );
    await cellOf(page, 10).click();
    await cellOf(page, 12).click();
    await expect(cellOf(page, 10)).toHaveAttribute("data-selected", "");
    await expect(cellOf(page, 12)).toHaveAttribute("data-selected", "");
    await expect(cellOf(page, 11)).not.toHaveAttribute("data-selected");
    await expectNoFalseStates(parts(page, "multiple-calendar"));
});

test("multiple-calendar / form: one hidden input per chosen date", async ({
    page,
}) => {
    await openScenario(page, "/multiple-calendar/form", { today: true });
    const inputs = part(page, "multiple-calendar", "input");
    await expect(inputs).toHaveCount(1);
    await expect(inputs.first()).toHaveAttribute("type", "hidden");
    await expect(inputs.first()).toHaveAttribute("name", "days");
    await expect(inputs.first()).toHaveValue("2026-11-20");
    await cellOf(page, 24).click();
    await expect(inputs).toHaveCount(2);
    await expect(inputs.nth(1)).toHaveValue("2026-11-24");
});
