import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { monthHeading } from "../../src/dates.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/month-calendar.md: the parts, named by the root they sit in
const cellOf = (
    page: import("@playwright/test").Page,
    component: string,
    month: number,
) =>
    page.locator(
        `[data-primitives-part="${component}-cell"][aria-label="${monthHeading("en-US", 2026, month)}"]`,
    );

test("month-calendar / basic: parts, 4 rows and 12 cells", async ({ page }) => {
    await openScenario(page, "/month-calendar/basic", { today: true });
    for (const name of [
        "root",
        "heading",
        "prev-button",
        "next-button",
        "grid",
        "grid-body",
    ]) {
        await expect(part(page, "month-calendar", name)).toHaveCount(1);
    }
    await expect(part(page, "month-calendar", "row")).toHaveCount(4);
    await expect(part(page, "month-calendar", "cell")).toHaveCount(12);
    await expect(part(page, "month-calendar", "heading")).toHaveAttribute(
        "aria-live",
        "polite",
    );
    const grid = part(page, "month-calendar", "grid");
    const gridId = await grid.getAttribute("id");
    await expect(part(page, "month-calendar", "prev-button")).toHaveAttribute(
        "aria-controls",
        gridId ?? "",
    );
    await expect(cellOf(page, "month-calendar", 11)).toHaveAttribute(
        "data-today",
        "",
    );
    await expect(cellOf(page, "month-calendar", 8)).toHaveAttribute(
        "data-unavailable",
        "",
    );
    await cellOf(page, "month-calendar", 3).click();
    await expect(cellOf(page, "month-calendar", 3)).toHaveAttribute(
        "data-selected",
        "",
    );
    await expectNoFalseStates(parts(page, "month-calendar"));
});

test("month-calendar / range: preview, start, end and the range parts", async ({
    page,
}) => {
    await openScenario(page, "/month-calendar/range", { today: true });
    await expect(parts(page, "month-calendar")).toHaveCount(0);
    await cellOf(page, "month-range-calendar", 3).click();
    await cellOf(page, "month-range-calendar", 6).hover();
    for (const month of [3, 4, 5, 6]) {
        await expect(
            cellOf(page, "month-range-calendar", month),
        ).toHaveAttribute("data-range-preview", "");
    }
    await cellOf(page, "month-range-calendar", 6).click();
    await expect(cellOf(page, "month-range-calendar", 3)).toHaveAttribute(
        "data-range-start",
        "",
    );
    await expect(cellOf(page, "month-range-calendar", 6)).toHaveAttribute(
        "data-range-end",
        "",
    );
    await expect(cellOf(page, "month-range-calendar", 4)).toHaveAttribute(
        "data-in-range",
        "",
    );
    await expectNoFalseStates(parts(page, "month-range-calendar"));
});
