import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";
import { fieldGroup, segment, typeKeys } from "../../src/segments.ts";

// spec/time-zones.md: zoned date-time fields and pickers across DST changes. Today is fixed at
// 2026-11-20; every value names its zone, and every zone name is computed in the browser.

/** `Intl`'s short name of a zone at an instant (UTC ISO text). */
function zoneName(page: Page, timeZone: string, instant: string) {
    return page.evaluate(
        ({ timeZone, instant }) =>
            new Intl.DateTimeFormat("en-US", {
                timeZone,
                timeZoneName: "short",
            })
                .formatToParts(new Date(instant))
                .find((part) => part.type === "timeZoneName")
                ?.value.replace(/[   ]/g, " ") ?? "",
        { timeZone, instant },
    );
}

/** A group's time zone segment. */
const zoneSegment = (group: Locator) =>
    group.locator('[data-type="timeZoneName"]');

test.describe("time-zones / field", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/time-zones/field", { today: true });
    });

    test("the zone segment names the zone at the value's instant", async ({
        page,
    }) => {
        const departure = fieldGroup(page, "Departure");
        await expect(segment(departure, "hour")).toHaveAttribute(
            "aria-valuenow",
            "1",
        );
        const zone = zoneSegment(departure);
        await expect(zone).toHaveText(
            await zoneName(page, "America/New_York", "2026-11-01T05:30:00Z"),
        );
        await expect(zone).not.toHaveAttribute("role", /.+/);
        await expect(zone).not.toHaveAttribute("aria-hidden", /.+/);
        // an hour later on the wall clock is past the change: EST
        await segment(departure, "hour").focus();
        await page.keyboard.press("ArrowUp");
        await expectOutput(
            page,
            "departure",
            "2026-11-01T02:30-05:00[America/New_York]",
        );
        await expect(zone).toHaveText(
            await zoneName(page, "America/New_York", "2026-11-01T07:30:00Z"),
        );
        await expect(zoneSegment(fieldGroup(page, "Arrival"))).toHaveCount(0);
    });

    test("a skipped and a repeated wall time resolve with the disambiguation", async ({
        page,
    }) => {
        const back = fieldGroup(page, "Return");
        await segment(back, "month").focus();
        await typeKeys(page, "030820260230A");
        // the segments keep the typed wall time; the value is resolved (later: 03:30 EDT)
        await expectOutput(
            page,
            "return",
            "2026-03-08T03:30-04:00[America/New_York]",
        );
        await expect(segment(back, "hour")).toHaveAttribute(
            "aria-valuenow",
            "2",
        );
        await expect(segment(back, "minute")).toHaveAttribute(
            "aria-valuenow",
            "30",
        );
        await segment(back, "month").focus();
        await typeKeys(page, "1101202601");
        await expectOutput(
            page,
            "return",
            "2026-11-01T01:30-05:00[America/New_York]",
        );
    });

    test("a zoned range, and the form submitting zoned ISO texts", async ({
        page,
    }) => {
        const stay = page.locator(
            '[data-primitives-part="date-range-field-input"]',
        );
        await stay.first().getByRole("spinbutton").first().focus();
        await typeKeys(page, "110120260130A110220260900A");
        await expectOutput(
            page,
            "stay",
            "2026-11-01T01:30-04:00[America/New_York]/2026-11-02T09:00-05:00[America/New_York]",
        );
        await segment(fieldGroup(page, "Return"), "month").focus();
        await typeKeys(page, "030820260230A");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(
            page,
            "departure=2026-11-01T01:30-04:00[America/New_York]&return=2026-03-08T03:30-04:00[America/New_York]&arrival=&from=2026-11-01T01:30-04:00[America/New_York]&to=2026-11-02T09:00-05:00[America/New_York]",
        );
    });

    test("axe", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("time-zones / picker", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/time-zones/picker", { today: true });
    });

    test("a chosen date takes the typed time, resolved in the zone", async ({
        page,
    }) => {
        const meeting = fieldGroup(page, "Meeting");
        await expect(zoneSegment(meeting)).toHaveText(
            await zoneName(page, "America/New_York", "2026-03-07T07:30:00Z"),
        );
        await page.getByRole("button", { name: "Meeting Choose date" }).click();
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Enter");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expectOutput(
            page,
            "meeting",
            "2026-03-08T03:30-04:00[America/New_York]",
        );
        await expect(segment(meeting, "hour")).toHaveAttribute(
            "aria-valuenow",
            "3",
        );
        await expect(zoneSegment(meeting)).toHaveText(
            await zoneName(page, "America/New_York", "2026-03-08T07:30:00Z"),
        );
    });

    test("a zoned range picker", async ({ page }) => {
        await page.getByRole("button", { name: "Trip Choose dates" }).click();
        await page.keyboard.press("Enter");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Enter");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expectOutput(
            page,
            "trip",
            "2026-11-20T00:00-05:00[America/New_York]/2026-11-21T00:00-05:00[America/New_York]",
        );
    });

    test("axe, the popup open and closed", async ({ page }) => {
        await expectNoAxeViolations(page);
        await page.getByRole("button", { name: "Meeting Choose date" }).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await expectNoAxeViolations(page);
    });
});
