import { describe, expect, it } from "vitest";
import {
    hebrew,
    japanese,
    persian,
} from "../../src/calendar-systems/systems.ts";
import { dateSegments } from "../../src/segments/date-segments.ts";
import { segmentFormat } from "../../src/segments/segment-format.ts";
import { segmentKeyDown } from "../../src/segments/segment-keys.ts";
import { typeSegment } from "../../src/segments/segment-typing.ts";
import {
    segmentRange,
    segmentsToDate,
    segmentsToDateTime,
    segmentValuesOf,
    setSegment,
} from "../../src/segments/segment-values.ts";
import { timeZone } from "../../src/time-zone/time-zone.ts";
import { toIsoZoned, toZoned } from "../../src/time-zone/zoned-date-time.ts";

const NOV_20 = { year: 2026, month: 11, day: 20 };

/** What `Intl` writes for a date in a locale with a calendar (`timeZone: "UTC"`), by part. */
function intl(locale: string, date = NOV_20): Record<string, string> {
    const utc = new Date(Date.UTC(date.year, date.month - 1, date.day));
    return Object.fromEntries(
        new Intl.DateTimeFormat(locale, {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            timeZone: "UTC",
        })
            .formatToParts(utc)
            .map((part) => [part.type, part.value]),
    );
}

describe("segments in a calendar system (spec/calendar-systems.md)", () => {
    it("shows and edits the system's fields, the value staying ISO", () => {
        const format = segmentFormat({
            locale: "fa-IR",
            kind: "date",
            calendar: persian,
        });
        const values = segmentValuesOf(format, NOV_20);
        expect(values).toEqual({ year: 1405, month: 8, day: 29 });
        const texts = Object.fromEntries(
            dateSegments(format, values).map((segment) => [
                segment.type,
                segment.text,
            ]),
        );
        const expected = intl("fa-IR-u-ca-persian");
        expect(texts.year).toBe(expected.year);
        expect(texts.month).toBe(expected.month);
        expect(texts.day).toBe(expected.day);
        expect(segmentsToDate(values, format)).toEqual(NOV_20);
        // Aban has 30 days: the day's range follows the system's month
        expect(segmentRange(format, values, "day").max).toBe(30);
        const esfand = setSegment(format, values, "month", 12);
        expect(segmentRange(format, esfand, "day").max).toBe(
            persian.daysInMonth(1405, 12),
        );
        // the next day of the month moves into the system's next month
        const step = segmentKeyDown(format, values, "day", "ArrowUp", null);
        expect(segmentsToDate(step?.values ?? {}, format)).toEqual({
            year: 2026,
            month: 11,
            day: 21,
        });
    });

    it("has a 13th month in a Hebrew leap year, clamped away in a common one", () => {
        const format = segmentFormat({
            locale: "he-IL",
            kind: "date",
            calendar: hebrew,
        });
        // 5784 is a leap year, 5785 a common one
        const leap = segmentValuesOf(
            format,
            hebrew.fromFields({ year: 5784, month: 13, day: 29 }),
        );
        expect(leap).toMatchObject({ year: 5784, month: 13, day: 29 });
        expect(segmentRange(format, leap, "month").max).toBe(13);
        const common = setSegment(format, leap, "year", 5785);
        expect(common.month).toBe(12);
        expect(segmentRange(format, common, "month").max).toBe(12);
        const month = dateSegments(format, leap).find(
            (segment) => segment.type === "month",
        );
        // he-IL writes the Hebrew months by name, even as "numeric"
        expect(month?.text).toBe(
            intl(
                "he-IL-u-ca-hebrew",
                hebrew.fromFields({ year: 5784, month: 13, day: 29 }),
            ).month,
        );
        expect(month?.valueText).toBe(
            new Intl.DateTimeFormat("he-IL-u-ca-hebrew", {
                month: "long",
                timeZone: "UTC",
            }).format(
                new Date(
                    Date.UTC(
                        2024,
                        hebrew.fromFields({ year: 5784, month: 13, day: 29 })
                            .month - 1,
                        hebrew.fromFields({ year: 5784, month: 13, day: 29 })
                            .day,
                    ),
                ),
            ),
        );
    });

    it("edits a Japanese date's era, its year being the era's", () => {
        const format = segmentFormat({
            locale: "ja-JP",
            kind: "date",
            calendar: japanese,
        });
        expect(format.types).toEqual(["era", "year", "month", "day"]);
        expect(format.eras).toHaveLength(5);
        const values = segmentValuesOf(format, NOV_20);
        expect(values).toEqual({ era: 4, year: 8, month: 11, day: 20 });
        const era = dateSegments(format, values).find(
            (segment) => segment.type === "era",
        );
        expect(era).toMatchObject({
            editable: true,
            value: 4,
            min: 0,
            max: 4,
            text: intl("ja-JP-u-ca-japanese").era,
        });
        // ArrowDown: Heisei 8 is 1996
        const heisei = segmentKeyDown(format, values, "era", "ArrowDown", null);
        expect(segmentsToDate(heisei?.values ?? {}, format)).toEqual({
            year: 1996,
            month: 11,
            day: 20,
        });
        // a letter picks the era whose name starts with it, as a day period
        const typed = typeSegment(
            format,
            values,
            "era",
            (format.eras?.[2] ?? "").slice(0, 1),
            null,
        );
        expect(typed?.values.era).toBe(2);
        const erased = segmentKeyDown(format, values, "era", "Backspace", null);
        expect(erased?.values.era).toBeUndefined();
        expect(segmentsToDate({ year: 8, month: 11, day: 20 }, format)).toEqual(
            // a placeholder era counts as the current one
            NOV_20,
        );
    });

    it("keeps the ISO calendar's segments with no system", () => {
        const format = segmentFormat({ locale: "en-US", kind: "date" });
        expect(format.calendar).toBeUndefined();
        expect(format.types).toEqual(["month", "day", "year"]);
        expect(segmentValuesOf(format, NOV_20)).toEqual({
            year: 2026,
            month: 11,
            day: 20,
        });
    });
});

describe("segments with a time zone (spec/time-zones.md)", () => {
    const zone = timeZone("America/New_York");
    const format = segmentFormat({
        locale: "en-US",
        kind: "date",
        granularity: "minute",
        timeZone: zone,
    });

    it("shows the zone's name where the locale writes it, at the value's time", () => {
        expect(format.parts.at(-1)?.type).toBe("timeZoneName");
        const winter = segmentValuesOf(
            format,
            toZoned(
                { ...NOV_20, hour: 14, minute: 30, second: 0, millisecond: 0 },
                zone.id,
            ),
        );
        const summer = { ...winter, month: 7 };
        const name = (values: typeof winter) =>
            dateSegments(format, values).find(
                (segment) => segment.type === "timeZoneName",
            );
        expect(name(winter)).toMatchObject({ editable: false, text: "EST" });
        expect(name(summer)?.text).toBe("EDT");
        expect(
            segmentFormat({
                locale: "en-US",
                kind: "date",
                granularity: "minute",
                timeZone: zone,
                hideTimeZone: true,
            }).parts.some((part) => part.type === "timeZoneName"),
        ).toBe(false);
    });

    it("resolves the wall time with the disambiguation, and converts other zones' values", () => {
        const gap = { year: 2026, month: 3, day: 8, hour: 2, minute: 30 };
        const compatible = segmentsToDateTime(gap, format);
        expect(toIsoZoned(compatible as never)).toBe(
            "2026-03-08T03:30-04:00[America/New_York]",
        );
        const earlier = segmentsToDateTime(
            gap,
            segmentFormat({
                locale: "en-US",
                kind: "date",
                granularity: "minute",
                timeZone: zone,
                disambiguation: "earlier",
            }),
        );
        expect(toIsoZoned(earlier as never)).toBe(
            "2026-03-08T01:30-05:00[America/New_York]",
        );
        const reject = segmentFormat({
            locale: "en-US",
            kind: "date",
            granularity: "minute",
            timeZone: zone,
            disambiguation: "reject",
        });
        expect(segmentsToDateTime(gap, reject)).toBeNull();
        const london = toZoned(
            { ...NOV_20, hour: 16, minute: 0, second: 0, millisecond: 0 },
            "Europe/London",
        );
        expect(segmentValuesOf(format, london)).toMatchObject({
            hour: 11,
            minute: 0,
        });
    });
});
