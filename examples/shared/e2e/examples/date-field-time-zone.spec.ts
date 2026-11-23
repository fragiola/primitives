import { expect, type Page, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    part,
    requireExamples,
} from "../helpers.ts";

// date-field-time-zone: a meeting across time zones (spec/time-zones.md). Today is fixed at
// 2026-11-20 and every value names its zone, so nothing depends on the host's zone. A DateField
// in a Field labelled "Meeting (New York)", granularity `minute`, en-US,
// `timeZone("America/New_York")`, default 2026-11-24 09:00 there; a list of the same instant in
// London and Kolkata ("Tue, Nov 24, 14:00 <zone name>"); "ISO: <zoned ISO text>". Zone names
// are computed with the browser's own `Intl`.

const TODAY = new Date(2026, 10, 20, 10, 0, 0);

/** `Intl`'s short name of a zone at an instant (UTC epoch milliseconds), in en-US. */
function zoneName(page: Page, timeZone: string, instant: number) {
    return page.evaluate(
        ({ timeZone, instant }) =>
            new Intl.DateTimeFormat("en-US", {
                timeZone,
                timeZoneName: "short",
            })
                .formatToParts(instant)
                .find((p) => p.type === "timeZoneName")?.value ?? "",
        { timeZone, instant },
    );
}

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(TODAY);
});

test("the meeting is shown at the same instant in London and Kolkata", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "date-field-time-zone" });
    const group = frame.getByRole("group", { name: "Meeting (New York)" });
    const parts = group.getByRole("spinbutton");
    await expect(parts).toHaveCount(6);
    const zone = group.locator(
        `${part("date-field-segment")}[data-type="timeZoneName"]`,
    );
    const status = frame.getByRole("status");
    const london = frame.getByRole("definition").nth(0);
    const kolkata = frame.getByRole("definition").nth(1);

    // 09:00 EST is 14:00 UTC
    const november = Date.UTC(2026, 10, 24, 14);
    await expect(status).toHaveText(
        "ISO: 2026-11-24T09:00-05:00[America/New_York]",
    );
    await expect(zone).toHaveText(
        await zoneName(page, "America/New_York", november),
    );
    await expect(zone).not.toHaveAttribute("role");
    await expect(london).toHaveText(
        `Tue, Nov 24, 14:00 ${await zoneName(page, "Europe/London", november)}`,
    );
    await expect(kolkata).toHaveText(
        `Tue, Nov 24, 19:30 ${await zoneName(page, "Asia/Kolkata", november)}`,
    );

    // an hour later in New York is an hour later everywhere
    await group.locator('[data-type="hour"]').press("ArrowUp");
    await expect(status).toHaveText(
        "ISO: 2026-11-24T10:00-05:00[America/New_York]",
    );
    await expect(london).toContainText("Tue, Nov 24, 15:00");
    await expect(kolkata).toContainText("Tue, Nov 24, 20:30");
    expect(errors).toEqual([]);
});

test("a date after New York's spring change keeps the wall time there", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "date-field-time-zone" });
    const group = frame.getByRole("group", { name: "Meeting (New York)" });
    await group.locator('[data-type="month"]').focus();
    for (const key of "03092026") {
        await page.keyboard.press(key);
    }
    // 2026-03-09 09:00 EDT is 13:00 UTC: London is still on GMT, Kolkata has no DST
    const march = Date.UTC(2026, 2, 9, 13);
    await expect(frame.getByRole("status")).toHaveText(
        "ISO: 2026-03-09T09:00-04:00[America/New_York]",
    );
    await expect(
        group.locator(
            `${part("date-field-segment")}[data-type="timeZoneName"]`,
        ),
    ).toHaveText(await zoneName(page, "America/New_York", march));
    await expect(frame.getByRole("definition").nth(0)).toHaveText(
        `Mon, Mar 9, 13:00 ${await zoneName(page, "Europe/London", march)}`,
    );
    await expect(frame.getByRole("definition").nth(1)).toHaveText(
        `Mon, Mar 9, 18:30 ${await zoneName(page, "Asia/Kolkata", march)}`,
    );
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("date-field-time-zone");
    await page.clock.setFixedTime(TODAY);
    await page.goto(`${EMBED_BASE}?id=date-field-time-zone`);
    await expect(page.getByRole("spinbutton")).toHaveCount(6);
    expect(await axeViolations(page)).toEqual([]);
});
