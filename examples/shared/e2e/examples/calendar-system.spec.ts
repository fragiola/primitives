import { expect, type Page, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    part,
    requireExamples,
} from "../helpers.ts";

// calendar-system: a Persian calendar (spec/calendar-systems.md). Today is fixed at 2026-11-20
// (29 Aban 1405), as in the conformance suite. A right-to-left panel holds a Calendar ("Previous
// month", Heading, "Next month", Grid) and a DateField in a Field labelled "Date", both
// `calendar={persian}` and `locale="fa-IR"`, bound to one ISO date shown as "ISO: <date>". The
// expected names are computed with the browser's own `Intl`, never written here: engines differ
// in their ICU.

const TODAY = new Date(2026, 10, 20, 10, 0, 0);
const LOCALE = "fa-IR-u-ca-persian";

/** `Intl`'s names of ISO dates in the Persian calendar: a month's heading, a day cell's name. */
function persianNames(page: Page, dates: readonly string[]) {
    return page.evaluate(
        ({ locale, dates }) => {
            const local = (iso: string) => {
                const [year, month, day] = iso.split("-").map(Number) as [
                    number,
                    number,
                    number,
                ];
                return new Date(year, month - 1, day);
            };
            const heading = new Intl.DateTimeFormat(locale, {
                month: "long",
                year: "numeric",
            });
            // a day cell in a system is named with explicit fields (spec/calendar-systems.md)
            const full = new Intl.DateTimeFormat(locale, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
            return dates.map((iso) => ({
                heading: heading.format(local(iso)),
                cell: full.format(local(iso)),
            }));
        },
        { locale: LOCALE, dates },
    );
}

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(TODAY);
});

test("the grid and the field are Persian, and share one ISO date", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "calendar-system" });
    const [today, next, aban1] = await persianNames(page, [
        "2026-11-20",
        "2026-11-21",
        "2026-10-23",
    ]);
    const status = frame.getByRole("status");
    await expect(status).toHaveText("ISO: 2026-11-20");
    // the grid is the Persian month of today (Aban 1405), named by its heading
    const grid = frame.getByRole("grid", { name: today?.heading });
    await expect(grid).toBeVisible();
    await expect(
        grid.getByRole("gridcell", { name: today?.cell }),
    ).toHaveAttribute("aria-selected", "true");
    const day = frame.locator(`${part("date-field-segment")}[data-type="day"]`);
    await expect(day).toHaveAttribute("aria-valuenow", "29");

    // a press on 30 Aban sets the date, and the field follows
    await grid.getByRole("gridcell", { name: next?.cell }).click();
    await expect(status).toHaveText("ISO: 2026-11-21");
    await expect(day).toHaveAttribute("aria-valuenow", "30");
    await expect(day).toHaveAttribute("aria-valuemax", "30");

    // ArrowUp on the field's day wraps inside Aban: 1 Aban 1405 is 2026-10-23
    await day.press("ArrowUp");
    await expect(status).toHaveText("ISO: 2026-10-23");
    await expect(
        grid.getByRole("gridcell", { name: aban1?.cell }),
    ).toHaveAttribute("aria-selected", "true");
    expect(errors).toEqual([]);
});

test("Page Down moves by a Persian month", async ({ page }) => {
    const frame = await openHosted(page, { id: "calendar-system" });
    const [, azar] = await persianNames(page, ["2026-11-20", "2026-12-20"]);
    const selected = frame.locator(
        `${part("calendar-cell")}[aria-selected="true"]`,
    );
    await selected.focus();
    await page.keyboard.press("PageDown");
    // 29 Azar 1405 is 2026-12-20: the focus moves there, the heading names Azar
    await expect(
        frame.getByRole("gridcell", { name: azar?.cell }),
    ).toBeFocused();
    await expect(
        frame.getByRole("grid", { name: azar?.heading }),
    ).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(frame.getByRole("status")).toHaveText("ISO: 2026-12-20");
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("calendar-system");
    await page.clock.setFixedTime(TODAY);
    await page.goto(`${EMBED_BASE}?id=calendar-system`);
    await expect(page.getByRole("grid")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
