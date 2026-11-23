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
    segment,
    segmentName,
    segmentTypes,
    spinbuttons,
    typeKeys,
    validity,
} from "../../src/segments.ts";

// spec/date-field.md, TimeField

async function open(page: Page, path: string, locale?: string) {
    await openScenario(page, path, {
        today: true,
        ...(locale === undefined ? {} : { locale }),
    });
}

const hiddenInput = (page: Page) =>
    page.locator('[data-primitives-part="time-field-hidden-input"]').first();

test.describe("time-field / basic", () => {
    test.beforeEach(async ({ page }) => {
        await open(page, "/time-field/basic");
    });

    test("a 12-hour time: hour, minute and day period", async ({ page }) => {
        const group = fieldGroup(page, "Meeting time");
        expect(await segmentTypes(group)).toEqual(
            await intlOrder(page, "en-US", {
                hour: "numeric",
                minute: "2-digit",
            }),
        );
        await expect(spinbuttons(group)).toHaveCount(3);
        const hour = segment(group, "hour");
        await expect(hour).toHaveAttribute("aria-valuemin", "1");
        await expect(hour).toHaveAttribute("aria-valuemax", "12");
        await expect(segment(group, "minute")).toHaveAttribute(
            "aria-valuemax",
            "59",
        );
        await expect(segment(group, "dayPeriod")).toHaveAttribute(
            "aria-valuemax",
            "1",
        );
        const name = await segmentName(page, "en-US", "hour");
        await expect(
            page.getByRole("spinbutton", { name: `Meeting time ${name}` }),
        ).toHaveAttribute("data-type", "hour");
        await expectPlaceholders(group);
    });

    test("typing, the day period's letters and its arrows", async ({
        page,
    }) => {
        const group = fieldGroup(page, "Meeting time");
        const [am, pm] = await dayPeriods(page, "en-US");
        await segment(group, "hour").focus();
        await page.keyboard.press("9");
        await expect(segment(group, "minute")).toBeFocused();
        await typeKeys(page, "30");
        await expect(segment(group, "dayPeriod")).toBeFocused();
        await page.keyboard.press(pm.charAt(0).toLowerCase());
        await expectOutput(page, "value", "21:30");
        await expectOutput(page, "reason", "input-change");
        const dayPeriod = segment(group, "dayPeriod");
        await expect(dayPeriod).toHaveAttribute("aria-valuetext", pm);
        await dayPeriod.press("ArrowUp");
        await expectOutput(page, "value", "09:30");
        await expectOutput(page, "reason", "keyboard");
        const hour = segment(group, "hour");
        await hour.press("ArrowUp");
        await hour.press("ArrowUp");
        await hour.press("ArrowUp");
        // 12 AM: the hour stays in its half of the day
        await expectOutput(page, "value", "00:30");
        await expect(hour).toHaveAttribute("aria-valuenow", "12");
        await hour.press("ArrowUp");
        await expectOutput(page, "value", "01:30");
        await dayPeriod.focus();
        await page.keyboard.press(am.charAt(0).toLowerCase());
        await expect(dayPeriod).toHaveAttribute("aria-valuetext", am);
        await dayPeriod.press("Backspace");
        await expectOutput(page, "value", "none");
        await expectOutput(page, "reason", "input-clear");
        await expect(dayPeriod).toHaveAttribute("data-placeholder", "");
        await expectNoAxeViolations(page);
    });
});

test("time-field / basic?locale=de-DE: a 24-hour time", async ({ page }) => {
    await open(page, "/time-field/basic", "de-DE");
    const group = fieldGroup(page, "Meeting time");
    expect(await segmentTypes(group)).toEqual(["hour", "minute"]);
    await expect(segment(group, "hour")).toHaveAttribute("aria-valuemin", "0");
    await expect(segment(group, "hour")).toHaveAttribute("aria-valuemax", "23");
    await segment(group, "hour").focus();
    await typeKeys(page, "1430");
    await expectOutput(page, "value", "14:30");
});

test("time-field / min-max: out of range, also across midnight", async ({
    page,
}) => {
    await open(page, "/time-field/min-max");
    const group = fieldGroup(page, "Opening");
    const root = page.locator('[data-primitives-part="time-field-root"]');
    const hidden = hiddenInput(page);
    expect(await segmentTypes(group)).toEqual(["hour", "minute", "second"]);
    await expect(hidden).toHaveAttribute("type", "time");
    await expect(hidden).toHaveValue("09:00:00");
    expect(await validity(hidden)).toEqual(["valid"]);
    await expect(root).not.toHaveAttribute("data-invalid");

    const hour = segment(group, "hour");
    await hour.press("ArrowDown");
    await expectOutput(page, "value", "08:00:00");
    await expect(root).toHaveAttribute("data-invalid", "");
    await expect(hour).toHaveAttribute("aria-invalid", "true");
    expect(await validity(hidden)).toEqual(["rangeUnderflow"]);

    await hour.press("Home");
    await hour.press("ArrowDown");
    await expectOutput(page, "value", "23:00:00");
    await expect(root).toHaveAttribute("data-invalid", "");
    expect(await validity(hidden)).toEqual(["rangeOverflow"]);

    await typeKeys(page, "12");
    await expectOutput(page, "value", "12:00:00");
    await expect(root).not.toHaveAttribute("data-invalid");
    expect(await validity(hidden)).toEqual(["valid"]);
});

test("time-field / form: required, submitted as an ISO time, reset", async ({
    page,
}) => {
    await open(page, "/time-field/form");
    const alarm = fieldGroup(page, "Alarm");
    await page.getByRole("button", { name: "Submit" }).click();
    await expectSubmitted(page, "none");
    await expect(segment(alarm, "hour")).toBeFocused();
    await typeKeys(page, "0730");
    await page.getByRole("button", { name: "Submit" }).click();
    await expectSubmitted(page, "alarm=07:30&start=08:00");
    await page.getByRole("button", { name: "Reset" }).click();
    await expectPlaceholders(alarm);
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(segment(alarm, "hour")).toBeFocused();
    await expectSubmitted(page, "alarm=07:30&start=08:00");
    await expectNoAxeViolations(page);
});
