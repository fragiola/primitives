import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// time-field: a meeting time (spec/date-field.md, TimeField). A Field `name="meeting"` (Label
// "Meeting time", Description "Office hours: 9 AM to 5 PM.", Errors "Choose a time within office
// hours." and "Enter a time.") around a required TimeField, 09:00–17:00, en-US (12-hour);
// "Schedule" prints "Scheduled: <ISO>".

/** The en-US day period texts: AM, then PM (from the browser's own Intl). */
async function dayPeriods(page: import("@playwright/test").Page) {
    return page.evaluate(() => {
        const format = new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            hour12: true,
            timeZone: "UTC",
        });
        return [0, 12].map(
            (hour) =>
                format
                    .formatToParts(Date.UTC(2026, 10, 23, hour))
                    .find((part) => part.type === "dayPeriod")?.value ?? "",
        );
    });
}

test("hour, minutes and the day period's letter make the time", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "time-field" });
    const group = frame.getByRole("group", { name: "Meeting time" });
    await expect(group).toHaveAttribute(
        "data-primitives-part",
        "time-field-input",
    );
    const parts = group.getByRole("spinbutton");
    await expect(parts).toHaveCount(3);
    const [, pm] = await dayPeriods(page);
    await parts.first().focus();
    for (const key of `230${(pm ?? "P").charAt(0).toLowerCase()}`) {
        await page.keyboard.press(key);
    }
    await expect(parts.nth(2)).toHaveAttribute("aria-valuetext", pm ?? "");
    await frame.getByRole("button", { name: "Schedule" }).click();
    await expect(frame.getByRole("status")).toHaveText("Scheduled: 14:30");
    expect(errors).toEqual([]);
});

test("a time outside office hours shows the error", async ({ page }) => {
    const frame = await openHosted(page, { id: "time-field" });
    const parts = frame
        .getByRole("group", { name: "Meeting time" })
        .getByRole("spinbutton");
    const [, pm] = await dayPeriods(page);
    await parts.first().focus();
    for (const key of `800${(pm ?? "P").charAt(0).toLowerCase()}`) {
        await page.keyboard.press(key);
    }
    await frame.getByRole("button", { name: "Schedule" }).click();
    await expect(
        frame.getByText("Choose a time within office hours."),
    ).toBeVisible();
    await expect(frame.getByRole("status")).toHaveText("");
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("time-field");
    await page.goto(`${EMBED_BASE}?id=time-field`);
    await expect(page.getByRole("spinbutton")).toHaveCount(3);
    expect(await axeViolations(page)).toEqual([]);
});
