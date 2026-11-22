import { expect, type Page, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { fullDate } from "../../src/dates.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/calendar.md: anatomy, state attributes, cell names. A part's attribute names its root:
// `calendar-<part>` in a Calendar, `range-calendar-<part>` in a RangeCalendar.
const cellOf = (
    page: Page,
    month: number,
    day: number,
    component = "calendar",
) =>
    page.locator(
        `[data-primitives-part="${component}-cell"][aria-label="${fullDate("en-US", 2026, month, day)}"]`,
    );

test("calendar / single: parts, six weeks, today and outside-month cells", async ({
    page,
}) => {
    await openScenario(page, "/calendar/single", { today: true });
    await expect(part(page, "calendar", "root")).toHaveCount(1);
    await expect(part(page, "calendar", "heading")).toHaveAttribute(
        "aria-live",
        "polite",
    );
    const prev = part(page, "calendar", "prev-button");
    await expect(prev).toHaveCount(1);
    await expect(prev).toHaveAttribute("type", "button");
    const grid = part(page, "calendar", "grid");
    await expect(grid).toHaveCount(1);
    const gridId = await grid.getAttribute("id");
    expect(gridId).toBeTruthy();
    await expect(prev).toHaveAttribute("aria-controls", gridId ?? "");
    await expect(part(page, "calendar", "next-button")).toHaveAttribute(
        "aria-controls",
        gridId ?? "",
    );
    const headingId = await part(page, "calendar", "heading").getAttribute(
        "id",
    );
    await expect(grid).toHaveAttribute("aria-labelledby", headingId ?? "");
    await expect(grid).not.toHaveAttribute("aria-multiselectable");
    await expect(part(page, "calendar", "grid-header")).toHaveCount(1);
    await expect(part(page, "calendar", "grid-body")).toHaveCount(1);
    const headerCells = part(page, "calendar", "header-cell");
    await expect(headerCells).toHaveCount(7);
    await expect(headerCells.first()).toHaveAttribute("abbr", "Sunday");
    await expect(headerCells.first()).toHaveAttribute("scope", "col");
    await expect(part(page, "calendar", "row")).toHaveCount(6);
    await expect(part(page, "calendar", "cell")).toHaveCount(42);
    const today = cellOf(page, 11, 20);
    await expect(today).toHaveAttribute("data-today", "");
    await expect(today).toHaveAttribute("aria-current", "date");
    await expect(today).toHaveAttribute("tabindex", "0");
    await expect(today).toHaveAttribute("role", "gridcell");
    await expect(today).not.toHaveAttribute("aria-selected");
    await expect(cellOf(page, 11, 21)).toHaveAttribute("tabindex", "-1");
    const outside = page.locator(
        '[data-primitives-part="calendar-cell"][data-outside-month]',
    );
    await expect(outside).toHaveCount(12);
    await expect(outside.first()).not.toHaveAttribute("tabindex");
    await expect(outside.first()).toHaveAttribute("aria-disabled", "true");
    await today.click();
    await expect(today).toHaveAttribute("data-selected", "");
    await expect(today).toHaveAttribute("aria-selected", "true");
    await expect(part(page, "calendar", "root")).not.toHaveAttribute(
        "data-disabled",
    );
    await expect(parts(page, "range-calendar")).toHaveCount(0);
    await expectNoFalseStates(page.locator("[data-primitives-part]"));
});

test("calendar / min-max and unavailable: disabled and unavailable cells", async ({
    page,
}) => {
    await openScenario(page, "/calendar/min-max", { today: true });
    await expect(cellOf(page, 11, 9)).toHaveAttribute("data-disabled", "");
    await expect(cellOf(page, 11, 9)).toHaveAttribute("aria-disabled", "true");
    const prev = part(page, "calendar", "prev-button");
    await expect(prev).toHaveAttribute("data-disabled", "");
    await expect(prev).toHaveAttribute("disabled", "");
    await expect(part(page, "calendar", "next-button")).not.toHaveAttribute(
        "data-disabled",
    );
    await expectNoFalseStates(page.locator("[data-primitives-part]"));
    await openScenario(page, "/calendar/unavailable", { today: true });
    await expect(cellOf(page, 11, 21)).toHaveAttribute("data-unavailable", "");
    await expect(cellOf(page, 11, 20)).not.toHaveAttribute("data-unavailable");
});

test("calendar / two-months: two headings and grids, one live heading", async ({
    page,
}) => {
    await openScenario(page, "/calendar/two-months", { today: true });
    const headings = part(page, "calendar", "heading");
    await expect(headings).toHaveCount(2);
    await expect(headings.first()).toHaveAttribute("aria-live", "polite");
    await expect(headings.nth(1)).not.toHaveAttribute("aria-live");
    const grids = part(page, "calendar", "grid");
    await expect(grids).toHaveCount(2);
    const ids = await grids.evaluateAll((elements) =>
        elements.map((element) => element.id),
    );
    await expect(part(page, "calendar", "next-button")).toHaveAttribute(
        "aria-controls",
        ids.join(" "),
    );
    await expect(grids.nth(1)).toHaveAttribute(
        "aria-labelledby",
        (await headings.nth(1).getAttribute("id")) ?? "",
    );
});

test("calendar / range: the range calendar's parts, preview, start, end and in-range cells", async ({
    page,
}) => {
    await openScenario(page, "/calendar/range", { today: true });
    await expect(part(page, "range-calendar", "root")).toHaveCount(1);
    for (const name of [
        "heading",
        "prev-button",
        "next-button",
        "grid",
        "grid-header",
        "grid-body",
    ]) {
        await expect(part(page, "range-calendar", name)).toHaveCount(1);
    }
    await expect(part(page, "range-calendar", "header-cell")).toHaveCount(7);
    await expect(part(page, "range-calendar", "row")).toHaveCount(6);
    await expect(parts(page, "calendar")).toHaveCount(0);
    await expect(part(page, "range-calendar", "grid")).toHaveAttribute(
        "aria-multiselectable",
        "true",
    );
    await cellOf(page, 11, 10, "range-calendar").click();
    await cellOf(page, 11, 15, "range-calendar").hover();
    for (const day of [10, 12, 15]) {
        await expect(cellOf(page, 11, day, "range-calendar")).toHaveAttribute(
            "data-range-preview",
            "",
        );
    }
    await expect(cellOf(page, 11, 16, "range-calendar")).not.toHaveAttribute(
        "data-range-preview",
    );
    await cellOf(page, 11, 15, "range-calendar").click();
    await expect(cellOf(page, 11, 10, "range-calendar")).toHaveAttribute(
        "data-range-start",
        "",
    );
    await expect(cellOf(page, 11, 15, "range-calendar")).toHaveAttribute(
        "data-range-end",
        "",
    );
    await expect(cellOf(page, 11, 12, "range-calendar")).toHaveAttribute(
        "data-in-range",
        "",
    );
    await expect(cellOf(page, 11, 12, "range-calendar")).toHaveAttribute(
        "data-selected",
        "",
    );
    await expect(cellOf(page, 11, 16, "range-calendar")).not.toHaveAttribute(
        "data-in-range",
    );
    await expect(cellOf(page, 11, 12, "range-calendar")).not.toHaveAttribute(
        "data-range-preview",
    );
    await expectNoFalseStates(page.locator("[data-primitives-part]"));
});

test("calendar / range: after a hover, the keyboard moves the preview", async ({
    page,
}) => {
    await openScenario(page, "/calendar/range", { today: true });
    await cellOf(page, 11, 10, "range-calendar").click();
    await cellOf(page, 11, 15, "range-calendar").hover();
    await expect(cellOf(page, 11, 12, "range-calendar")).toHaveAttribute(
        "data-range-preview",
        "",
    );
    await page.keyboard.press("ArrowLeft");
    await expect(cellOf(page, 11, 9, "range-calendar")).toHaveAttribute(
        "data-range-preview",
        "",
    );
    await expect(cellOf(page, 11, 12, "range-calendar")).not.toHaveAttribute(
        "data-range-preview",
    );
});

test("date-picker / basic: picker parts and the trigger's popup state", async ({
    page,
}) => {
    await openScenario(page, "/date-picker/basic", { today: true });
    const trigger = part(page, "date-picker", "trigger");
    await expect(trigger).toHaveAttribute("type", "button");
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await expect(trigger).not.toHaveAttribute("data-popup-open");
    await expect(trigger).not.toHaveAttribute("aria-controls");
    await expect(part(page, "date-picker", "popup")).toHaveCount(0);
    await trigger.click();
    // a trigger says its popup is open (D4 §3 "Naming"); `data-open` is the popup's own
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    await expect(trigger).not.toHaveAttribute("data-open");
    const popup = part(page, "date-picker", "popup");
    await expect(popup).toHaveAttribute("data-open", "");
    await expect(popup).toHaveAttribute("role", "dialog");
    await expect(popup).not.toHaveAttribute("aria-modal");
    await expect(trigger).toHaveAttribute(
        "aria-controls",
        (await popup.getAttribute("id")) ?? "",
    );
    const positioner = part(page, "date-picker", "positioner");
    await expect(positioner).toHaveAttribute("data-side", "bottom");
    await expect(positioner).toHaveAttribute("data-align", "start");
    await expect(positioner).toHaveAttribute("data-open", "");
    await expect(popup).toHaveAttribute("data-side", "bottom");
    await expect(popup).toHaveAttribute("data-align", "start");
    // the bound calendar is a Calendar
    await expect(part(popup, "calendar", "root")).toHaveCount(1);
    await expectNoFalseStates(page.locator("[data-primitives-part]"));
});

test("date-picker / range: the range picker's parts and its range calendar", async ({
    page,
}) => {
    await openScenario(page, "/date-picker/range", { today: true });
    const trigger = part(page, "date-range-picker", "trigger");
    await expect(trigger).toHaveCount(1);
    await expect(parts(page, "date-picker")).toHaveCount(0);
    await trigger.click();
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    const popup = part(page, "date-range-picker", "popup");
    await expect(popup).toHaveAttribute("data-open", "");
    await expect(part(page, "date-range-picker", "positioner")).toHaveCount(1);
    await expect(part(popup, "range-calendar", "root")).toHaveCount(1);
    await expect(part(popup, "range-calendar", "grid")).toHaveAttribute(
        "aria-multiselectable",
        "true",
    );
    await expectNoFalseStates(page.locator("[data-primitives-part]"));
});
