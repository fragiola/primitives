import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";
import {
    dayPeriods,
    expectPlaceholders,
    fieldGroup,
    intlOrder,
    lefts,
    segment,
    segmentName,
    segmentTypes,
    spinbuttons,
    typeKeys,
    validity,
} from "../../src/segments.ts";

// spec/date-field.md, DateField. Every scenario fixes today at 2026-11-20 and passes its locale

const DATE = { year: "numeric", month: "numeric", day: "numeric" } as const;

async function open(page: Page, path: string, locale?: string, rtl = false) {
    await openScenario(page, path, {
        today: true,
        ...(locale === undefined ? {} : { locale }),
        ...(rtl ? { dir: "rtl" as const } : {}),
    });
}

/** Types 2026-11-23 into a date field whose first segment is focused, in the locale's order. */
async function typeDate(page: Page, order: string[]): Promise<void> {
    const digits: Record<string, string> = {
        year: "2026",
        month: "11",
        day: "23",
    };
    for (const type of order) {
        await typeKeys(page, digits[type] ?? "");
    }
}

/** The hidden input of the first (or `index`th) date field. */
function hiddenInput(page: Page, index = 0) {
    return page
        .locator('[data-primitives-part="date-field-hidden-input"]')
        .nth(index);
}

test.describe("date-field / basic", () => {
    test.beforeEach(async ({ page }) => {
        await open(page, "/date-field/basic");
    });

    test("a group named by the label, a spinbutton per segment in the locale's order", async ({
        page,
    }) => {
        const group = fieldGroup(page, "Birth date");
        await expect(spinbuttons(group)).toHaveCount(3);
        expect(await segmentTypes(group)).toEqual(
            await intlOrder(page, "en-US", DATE),
        );
        for (const type of ["month", "day", "year"]) {
            const name = await segmentName(page, "en-US", type);
            await expect(
                page.getByRole("spinbutton", {
                    name: `Birth date ${name}`,
                    exact: true,
                }),
            ).toHaveAttribute("tabindex", "0");
        }
        await expectPlaceholders(group);
        const month = segment(group, "month");
        await expect(month).toHaveAttribute("aria-valuemin", "1");
        await expect(month).toHaveAttribute("aria-valuemax", "12");
        await expect(month).not.toHaveAttribute("aria-valuetext");
        await expect(segment(group, "year")).toHaveAttribute(
            "aria-valuemax",
            "9999",
        );
    });

    test("typing fills a segment and moves on, until the date is complete", async ({
        page,
    }) => {
        const group = fieldGroup(page, "Birth date");
        const month = segment(group, "month");
        await month.focus();
        await typeKeys(page, "11");
        await expect(month).toHaveAttribute("aria-valuenow", "11");
        const november = await page.evaluate(() =>
            new Intl.DateTimeFormat("en-US", {
                month: "long",
                timeZone: "UTC",
            }).format(Date.UTC(2026, 10, 1)),
        );
        await expect(month).toHaveAttribute("aria-valuetext", november);
        await expect(month).toHaveText("11");
        await expect(segment(group, "day")).toBeFocused();
        await typeKeys(page, "23");
        await expect(segment(group, "year")).toBeFocused();
        await typeKeys(page, "202");
        // a year is any number from 1: each digit already completes the value
        await expectOutput(page, "value", "0202-11-23");
        await typeKeys(page, "6");
        await expectOutput(page, "value", "2026-11-23");
        await expectOutput(page, "reason", "input-change");
        await expect(segment(group, "year")).toHaveAttribute(
            "aria-valuenow",
            "2026",
        );
    });

    test("a digit no other can follow moves on at once; a leading zero waits", async ({
        page,
    }) => {
        const group = fieldGroup(page, "Birth date");
        const month = segment(group, "month");
        await month.focus();
        await page.keyboard.press("4");
        await expect(month).toHaveAttribute("aria-valuenow", "4");
        await expect(segment(group, "day")).toBeFocused();
        await month.focus();
        await page.keyboard.press("0");
        await expect(month).toHaveText("0");
        await expect(month).not.toHaveAttribute("aria-valuenow");
        await expect(month).toBeFocused();
        await page.keyboard.press("5");
        await expect(month).toHaveAttribute("aria-valuenow", "5");
        await expect(segment(group, "day")).toBeFocused();
    });

    test("the keys step a segment, wrapping within it", async ({ page }) => {
        const group = fieldGroup(page, "Birth date");
        await segment(group, "month").focus();
        await typeDate(page, ["month", "day", "year"]);
        await expectOutput(page, "value", "2026-11-23");
        const year = segment(group, "year");
        await year.press("ArrowUp");
        await expectOutput(page, "value", "2027-11-23");
        await expectOutput(page, "reason", "keyboard");
        await year.press("ArrowDown");
        await year.press("ArrowDown");
        await expectOutput(page, "value", "2025-11-23");
        await year.press("PageUp");
        await expectOutput(page, "value", "2030-11-23");
        const day = segment(group, "day");
        await day.press("End");
        await expectOutput(page, "value", "2030-11-30");
        await day.press("Home");
        await expectOutput(page, "value", "2030-11-01");
        await day.press("ArrowDown");
        await expectOutput(page, "value", "2030-11-30");
    });

    test("ArrowLeft and ArrowRight move between the segments", async ({
        page,
    }) => {
        const group = fieldGroup(page, "Birth date");
        await segment(group, "year").focus();
        await page.keyboard.press("ArrowLeft");
        await expect(segment(group, "day")).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(segment(group, "year")).toBeFocused();
    });

    test("Backspace erases a digit at a time, then moves back", async ({
        page,
    }) => {
        const group = fieldGroup(page, "Birth date");
        await segment(group, "month").focus();
        await typeDate(page, ["month", "day", "year"]);
        await expectOutput(page, "value", "2026-11-23");
        const year = segment(group, "year");
        await year.press("Backspace");
        await expect(year).toHaveAttribute("aria-valuenow", "202");
        await year.press("Backspace");
        await year.press("Backspace");
        await year.press("Backspace");
        await expectOutput(page, "value", "none");
        await expectOutput(page, "reason", "input-clear");
        await expect(year).toHaveAttribute("data-placeholder", "");
        await expect(year).toBeFocused();
        await year.press("Backspace");
        await expect(segment(group, "day")).toBeFocused();
    });

    test("an arrow on a placeholder starts from the placeholder value", async ({
        page,
    }) => {
        const month = segment(fieldGroup(page, "Birth date"), "month");
        await month.press("ArrowUp");
        // the placeholder value is today: November
        await expect(month).toHaveAttribute("aria-valuenow", "11");
    });

    test("moving between segments is no blur; leaving the field is", async ({
        page,
    }) => {
        const field = page.locator('[data-primitives-part="field-root"]');
        const group = fieldGroup(page, "Birth date");
        await segment(group, "month").focus();
        await typeKeys(page, "11");
        await expect(segment(group, "day")).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(field).toHaveAttribute("data-focused", "");
        await expect(field).not.toHaveAttribute("data-touched");
        await page.evaluate(() =>
            (document.activeElement as HTMLElement).blur(),
        );
        await expect(field).toHaveAttribute("data-touched", "");
        await expect(field).not.toHaveAttribute("data-focused");
    });

    test("a press on the label focuses the first segment", async ({ page }) => {
        await page.getByText("Birth date", { exact: true }).click();
        await expect(
            segment(fieldGroup(page, "Birth date"), "month"),
        ).toBeFocused();
    });

    test("no axe violation, empty and filled", async ({ page }) => {
        await expectNoAxeViolations(page);
        await segment(fieldGroup(page, "Birth date"), "month").focus();
        await typeDate(page, ["month", "day", "year"]);
        await expectOutput(page, "value", "2026-11-23");
        await expectNoAxeViolations(page);
    });
});

test("date-field / basic?locale=de-DE: the German order and names", async ({
    page,
}) => {
    await open(page, "/date-field/basic", "de-DE");
    const group = fieldGroup(page, "Birth date");
    const order = await intlOrder(page, "de-DE", DATE);
    expect(order).toEqual(["day", "month", "year"]);
    expect(await segmentTypes(group)).toEqual(order);
    const name = await segmentName(page, "de-DE", "month");
    await expect(
        page.getByRole("spinbutton", { name: `Birth date ${name}` }),
    ).toHaveAttribute("data-type", "month");
    await spinbuttons(group).first().focus();
    await typeDate(page, order);
    await expectOutput(page, "value", "2026-11-23");
});

test("date-field / basic?locale=he-IL&dir=rtl: the segments read left to right", async ({
    page,
}) => {
    await open(page, "/date-field/basic", "he-IL", true);
    const group = fieldGroup(page, "Birth date");
    expect(await segmentTypes(group)).toEqual(["day", "month", "year"]);
    const ascending = (values: number[]) =>
        values.every(
            (value, index) => index === 0 || value > (values[index - 1] ?? 0),
        );
    expect(ascending(await lefts(spinbuttons(group)))).toBe(true);
    await segment(group, "day").focus();
    await page.keyboard.press("ArrowRight");
    await expect(segment(group, "month")).toBeFocused();
    await segment(group, "day").focus();
    await typeDate(page, ["day", "month", "year"]);
    await expectOutput(page, "value", "2026-11-23");
    expect(ascending(await lefts(spinbuttons(group)))).toBe(true);
});

test("date-field / basic?locale=ar-EG&dir=rtl: the locale's digits, right to left", async ({
    page,
}) => {
    await open(page, "/date-field/basic", "ar-EG", true);
    const group = fieldGroup(page, "Birth date");
    expect(await segmentTypes(group)).toEqual(["day", "month", "year"]);
    const day = segment(group, "day");
    await day.focus();
    await typeKeys(page, "23");
    const shown = await page.evaluate(() =>
        new Intl.NumberFormat("ar-EG", {
            useGrouping: false,
            numberingSystem: new Intl.DateTimeFormat("ar-EG").resolvedOptions()
                .numberingSystem,
        }).format(23),
    );
    await expect(day).toHaveText(shown);
    await expect(day).toHaveAttribute("aria-valuenow", "23");
    await typeKeys(page, "112026");
    await expectOutput(page, "value", "2026-11-23");
    const descending = (values: number[]) =>
        values.every(
            (value, index) => index === 0 || value < (values[index - 1] ?? 0),
        );
    expect(descending(await lefts(spinbuttons(group)))).toBe(true);
    await day.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(segment(group, "month")).toBeFocused();
});

test.describe("date-field / min-max", () => {
    test.beforeEach(async ({ page }) => {
        await open(page, "/date-field/min-max");
    });

    test("a date out of range or unavailable is invalid", async ({ page }) => {
        const group = fieldGroup(page, "Arrival");
        const root = page.locator('[data-primitives-part="date-field-root"]');
        const hidden = hiddenInput(page);
        await segment(group, "month").focus();
        await typeKeys(page, "11092026");
        await expectOutput(page, "value", "2026-11-09");
        await expect(root).toHaveAttribute("data-invalid", "");
        for (const type of ["month", "day", "year"]) {
            await expect(segment(group, type)).toHaveAttribute(
                "aria-invalid",
                "true",
            );
        }
        expect(await validity(hidden)).toEqual(["rangeUnderflow"]);
        await expectNoAxeViolations(page);

        await segment(group, "day").focus();
        await typeKeys(page, "20");
        await expectOutput(page, "value", "2026-11-20");
        await expect(root).not.toHaveAttribute("data-invalid");
        await expect(segment(group, "day")).not.toHaveAttribute("aria-invalid");
        expect(await validity(hidden)).toEqual(["valid"]);

        // a Saturday: unavailable has no native validity
        await segment(group, "day").focus();
        await typeKeys(page, "21");
        await expectOutput(page, "value", "2026-11-21");
        await expect(root).toHaveAttribute("data-invalid", "");
        expect(await validity(hidden)).toEqual(["valid"]);

        await segment(group, "month").focus();
        await typeKeys(page, "12");
        await typeKeys(page, "06");
        await expectOutput(page, "value", "2026-12-06");
        await expect(root).toHaveAttribute("data-invalid", "");
        expect(await validity(hidden)).toEqual(["rangeOverflow"]);
    });
});

test.describe("date-field / form", () => {
    test.beforeEach(async ({ page }) => {
        await open(page, "/date-field/form");
    });

    test("a required field blocks the submission and takes the focus", async ({
        page,
    }) => {
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
        await expect(
            segment(fieldGroup(page, "Birth date"), "month"),
        ).toBeFocused();
        await typeDate(page, ["month", "day", "year"]);
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "birth=2026-11-23&start=2026-11-20");
    });

    test("a read-only field is focusable and does not change", async ({
        page,
    }) => {
        const group = fieldGroup(page, "Start");
        const month = segment(group, "month");
        await month.focus();
        await expect(month).toBeFocused();
        await month.press("ArrowUp");
        await expect(month).toHaveAttribute("aria-valuenow", "11");
        await expect(month).toHaveAttribute("aria-readonly", "true");
        await expect(month).not.toHaveAttribute("contenteditable");
        await page.keyboard.press("ArrowRight");
        await expect(segment(group, "day")).toBeFocused();
    });

    test("a disabled field has no tab stop", async ({ page }) => {
        const segments = spinbuttons(fieldGroup(page, "End"));
        await expect(segments).toHaveCount(3);
        for (let index = 0; index < 3; index += 1) {
            await expect(segments.nth(index)).not.toHaveAttribute("tabindex");
            await expect(segments.nth(index)).toHaveAttribute(
                "aria-disabled",
                "true",
            );
        }
    });

    test("a reset makes the segments placeholders again", async ({ page }) => {
        const group = fieldGroup(page, "Birth date");
        await segment(group, "month").focus();
        await typeDate(page, ["month", "day", "year"]);
        await expect(segment(group, "year")).toHaveAttribute(
            "aria-valuenow",
            "2026",
        );
        await page.getByRole("button", { name: "Reset" }).click();
        await expectPlaceholders(group);
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
        await expectNoAxeViolations(page);
    });
});

test.describe("date-field / date-time", () => {
    test("a 12-hour date and time, its day period typed by a letter", async ({
        page,
    }) => {
        await open(page, "/date-field/date-time");
        const group = fieldGroup(page, "Meeting");
        expect(await segmentTypes(group)).toEqual(
            await intlOrder(page, "en-US", {
                ...DATE,
                hour: "numeric",
                minute: "2-digit",
            }),
        );
        await expect(spinbuttons(group)).toHaveCount(6);
        await expect(segment(group, "hour")).toHaveAttribute(
            "aria-valuemin",
            "1",
        );
        await expect(segment(group, "hour")).toHaveAttribute(
            "aria-valuemax",
            "12",
        );
        await segment(group, "month").focus();
        await typeDate(page, ["month", "day", "year"]);
        await expect(segment(group, "hour")).toBeFocused();
        await page.keyboard.press("2");
        await expect(segment(group, "minute")).toBeFocused();
        await typeKeys(page, "30");
        await expect(segment(group, "dayPeriod")).toBeFocused();
        const [, pm] = await dayPeriods(page, "en-US");
        await page.keyboard.press(pm.charAt(0).toLowerCase());
        await expectOutput(page, "value", "2026-11-23T14:30");
        await expect(segment(group, "dayPeriod")).toHaveAttribute(
            "aria-valuetext",
            pm,
        );
        await page.keyboard.press("ArrowDown");
        await expectOutput(page, "value", "2026-11-23T02:30");
        await expectOutput(page, "reason", "keyboard");
        await expect(hiddenInput(page)).toHaveAttribute(
            "type",
            "datetime-local",
        );
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "meeting=2026-11-23T02:30");
        await expectNoAxeViolations(page);
    });

    test("?locale=de-DE: a 24-hour date and time", async ({ page }) => {
        await open(page, "/date-field/date-time", "de-DE");
        const group = fieldGroup(page, "Meeting");
        expect(await segmentTypes(group)).toEqual(
            await intlOrder(page, "de-DE", {
                ...DATE,
                hour: "numeric",
                minute: "2-digit",
            }),
        );
        await expect(segment(group, "dayPeriod")).toHaveCount(0);
        await expect(segment(group, "hour")).toHaveAttribute(
            "aria-valuemax",
            "23",
        );
        await spinbuttons(group).first().focus();
        await typeKeys(page, "231120261430");
        await expectOutput(page, "value", "2026-11-23T14:30");
    });
});
