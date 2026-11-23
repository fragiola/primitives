import { describe, expect, it } from "vitest";
import type { PlainDateTime } from "../../src/time/plain-date-time.ts";
import { timeZone } from "../../src/time-zone/time-zone.ts";
import {
    addZoned,
    compareZoned,
    cycleZoned,
    type Disambiguation,
    formatTimeZoneName,
    fromInstant,
    fromIsoZoned,
    localTimeZone,
    offsetAt,
    toInstant,
    toIsoOffset,
    toIsoZoned,
    toTimeZone,
    toZoned,
} from "../../src/time-zone/zoned-date-time.ts";

const at = (
    year: number,
    month: number,
    day: number,
    hour: number,
    minute = 0,
): PlainDateTime => ({
    year,
    month,
    day,
    hour,
    minute,
    second: 0,
    millisecond: 0,
});

/** The ISO text of a wall time resolved in a zone, per disambiguation. */
function resolved(
    value: PlainDateTime,
    zone: string,
): Record<Exclude<Disambiguation, "reject">, string> {
    return {
        compatible: toIsoZoned(toZoned(value, zone, "compatible")),
        earlier: toIsoZoned(toZoned(value, zone, "earlier")),
        later: toIsoZoned(toZoned(value, zone, "later")),
    };
}

// None of these depends on the host's zone: every value names its zone (spec/time-zones.md).
describe("zoned dates and times", () => {
    it("reads a zone's offsets from Intl, with and without DST", () => {
        const winter = Date.UTC(2026, 0, 15, 12);
        const summer = Date.UTC(2026, 6, 15, 12);
        expect(offsetAt("America/New_York", winter)).toBe(-5 * 3_600_000);
        expect(offsetAt("America/New_York", summer)).toBe(-4 * 3_600_000);
        expect(offsetAt("Europe/London", winter)).toBe(0);
        expect(offsetAt("Europe/London", summer)).toBe(3_600_000);
        // Lord Howe's DST is 30 minutes: +10:30 in winter (July), +11:00 in summer (January)
        expect(offsetAt("Australia/Lord_Howe", summer)).toBe(10.5 * 3_600_000);
        expect(offsetAt("Australia/Lord_Howe", winter)).toBe(11 * 3_600_000);
        // no DST
        expect(offsetAt("Asia/Kolkata", winter)).toBe(5.5 * 3_600_000);
        expect(offsetAt("Asia/Kolkata", summer)).toBe(5.5 * 3_600_000);
        expect(offsetAt("UTC", summer)).toBe(0);
    });

    it("converts instants both ways", () => {
        const instant = Date.UTC(2026, 10, 20, 15, 30);
        const zoned = fromInstant(instant, "Asia/Kolkata");
        expect(zoned).toEqual({
            ...at(2026, 11, 20, 21, 0),
            timeZone: "Asia/Kolkata",
            offset: 19_800_000,
        });
        expect(toInstant(zoned)).toBe(instant);
        expect(fromInstant(new Date(instant), "UTC")).toMatchObject({
            hour: 15,
            minute: 30,
        });
        expect(toIsoZoned(toTimeZone(zoned, "America/New_York"))).toBe(
            "2026-11-20T10:30-05:00[America/New_York]",
        );
        expect(localTimeZone()).toBe(
            new Intl.DateTimeFormat().resolvedOptions().timeZone,
        );
    });

    it("resolves a DST gap as Temporal: compatible and later forward, earlier back", () => {
        expect(resolved(at(2026, 3, 8, 2, 30), "America/New_York")).toEqual({
            compatible: "2026-03-08T03:30-04:00[America/New_York]",
            earlier: "2026-03-08T01:30-05:00[America/New_York]",
            later: "2026-03-08T03:30-04:00[America/New_York]",
        });
        expect(resolved(at(2026, 3, 29, 1, 30), "Europe/London")).toEqual({
            compatible: "2026-03-29T02:30+01:00[Europe/London]",
            earlier: "2026-03-29T00:30+00:00[Europe/London]",
            later: "2026-03-29T02:30+01:00[Europe/London]",
        });
        // a 30-minute gap: 02:00 → 02:30
        expect(resolved(at(2026, 10, 4, 2, 15), "Australia/Lord_Howe")).toEqual(
            {
                compatible: "2026-10-04T02:45+11:00[Australia/Lord_Howe]",
                earlier: "2026-10-04T01:45+10:30[Australia/Lord_Howe]",
                later: "2026-10-04T02:45+11:00[Australia/Lord_Howe]",
            },
        );
        expect(() =>
            toZoned(at(2026, 3, 8, 2, 30), "America/New_York", "reject"),
        ).toThrow(RangeError);
    });

    it("resolves a DST overlap as Temporal: compatible and earlier first, later second", () => {
        expect(resolved(at(2026, 11, 1, 1, 30), "America/New_York")).toEqual({
            compatible: "2026-11-01T01:30-04:00[America/New_York]",
            earlier: "2026-11-01T01:30-04:00[America/New_York]",
            later: "2026-11-01T01:30-05:00[America/New_York]",
        });
        expect(resolved(at(2026, 10, 25, 1, 30), "Europe/London")).toEqual({
            compatible: "2026-10-25T01:30+01:00[Europe/London]",
            earlier: "2026-10-25T01:30+01:00[Europe/London]",
            later: "2026-10-25T01:30+00:00[Europe/London]",
        });
        // a 30-minute overlap: 02:00 → 01:30
        expect(resolved(at(2026, 4, 5, 1, 45), "Australia/Lord_Howe")).toEqual({
            compatible: "2026-04-05T01:45+11:00[Australia/Lord_Howe]",
            earlier: "2026-04-05T01:45+11:00[Australia/Lord_Howe]",
            later: "2026-04-05T01:45+10:30[Australia/Lord_Howe]",
        });
        expect(() =>
            toZoned(at(2026, 11, 1, 1, 30), "America/New_York", "reject"),
        ).toThrow(RangeError);
        // a zone without DST has neither
        expect(resolved(at(2026, 3, 8, 2, 30), "Asia/Kolkata")).toEqual({
            compatible: "2026-03-08T02:30+05:30[Asia/Kolkata]",
            earlier: "2026-03-08T02:30+05:30[Asia/Kolkata]",
            later: "2026-03-08T02:30+05:30[Asia/Kolkata]",
        });
    });

    it("adds days in wall time and hours in exact time, across a DST change", () => {
        const before = toZoned(at(2026, 3, 7, 2, 30), "America/New_York");
        // the next day's 02:30 does not exist: compatible moves it to 03:30
        expect(toIsoZoned(addZoned(before, { days: 1 }))).toBe(
            "2026-03-08T03:30-04:00[America/New_York]",
        );
        const night = toZoned(at(2026, 3, 8, 1, 30), "America/New_York");
        expect(toIsoZoned(addZoned(night, { hours: 1 }))).toBe(
            "2026-03-08T03:30-04:00[America/New_York]",
        );
        const fall = toZoned(at(2026, 11, 1, 1, 30), "America/New_York");
        expect(toIsoZoned(addZoned(fall, { hours: 1 }))).toBe(
            "2026-11-01T01:30-05:00[America/New_York]",
        );
        expect(toIsoZoned(addZoned(fall, { months: 1 }))).toBe(
            "2026-12-01T01:30-05:00[America/New_York]",
        );
        expect(addZoned(fall, {})).toBe(fall);
    });

    it("cycles the hour through the day's real hours, the repeated one twice", () => {
        let value = toZoned(at(2026, 11, 1, 0, 30), "America/New_York");
        const hours: string[] = [];
        for (let step = 0; step < 26; step++) {
            hours.push(toIsoZoned(value).slice(11, 22));
            value = cycleZoned(value, "hour", 1);
        }
        expect(hours.slice(0, 4)).toEqual([
            "00:30-04:00",
            "01:30-04:00",
            "01:30-05:00",
            "02:30-05:00",
        ]);
        // 25 hours, then the day's first again
        expect(hours[25]).toBe(hours[0]);
        expect(new Set(hours).size).toBe(25);
        const spring = toZoned(at(2026, 3, 8, 1, 30), "America/New_York");
        expect(toIsoZoned(cycleZoned(spring, "hour", 1))).toBe(
            "2026-03-08T03:30-04:00[America/New_York]",
        );
        expect(toIsoZoned(cycleZoned(spring, "hour", -2))).toBe(
            "2026-03-08T23:30-04:00[America/New_York]",
        );
        // a minute keeps the overlap's second offset
        const later = toZoned(
            at(2026, 11, 1, 1, 30),
            "America/New_York",
            "later",
        );
        expect(toIsoZoned(cycleZoned(later, "minute", 45))).toBe(
            "2026-11-01T01:15-05:00[America/New_York]",
        );
    });

    it("writes and reads ISO text with the offset and the zone", () => {
        expect(toIsoOffset(19_800_000)).toBe("+05:30");
        expect(toIsoOffset(-14_400_000)).toBe("-04:00");
        expect(toIsoOffset(0)).toBe("+00:00");
        expect(toIsoOffset(-(17 * 60 + 32) * 1000 - 4 * 3_600_000)).toBe(
            "-04:17:32",
        );
        const later = fromIsoZoned("2026-11-01T01:30-05:00[America/New_York]");
        expect(later?.offset).toBe(-5 * 3_600_000);
        const earlier = fromIsoZoned("2026-11-01T01:30[America/New_York]");
        expect(earlier?.offset).toBe(-4 * 3_600_000);
        // an offset the zone does not have there: the wall time is resolved instead
        expect(
            toIsoZoned(
                fromIsoZoned("2026-03-08T02:30-05:00[America/New_York]") ??
                    toZoned(at(2000, 1, 1, 0), "UTC"),
            ),
        ).toBe("2026-03-08T03:30-04:00[America/New_York]");
        expect(fromIsoZoned("2026-11-01T01:30")).toBeNull();
        expect(fromIsoZoned("2026-11-01T01:30[Not/AZone]")).toBeNull();
        expect(
            toIsoZoned(
                toZoned(at(2026, 11, 20, 14, 30), "Asia/Kolkata"),
                "second",
            ),
        ).toBe("2026-11-20T14:30:00+05:30[Asia/Kolkata]");
    });

    it("compares instants, whatever the zones", () => {
        const a = toZoned(at(2026, 11, 20, 10), "America/New_York");
        const b = toZoned(at(2026, 11, 20, 16), "Europe/London");
        expect(compareZoned(a, b)).toBeLessThan(0);
        expect(compareZoned(b, a)).toBeGreaterThan(0);
        expect(compareZoned(a, toTimeZone(a, "Asia/Kolkata"))).toBe(0);
    });

    it("names the zone at the value's instant, as Intl does", () => {
        const name = (zone: string, value: PlainDateTime, locale = "en-US") =>
            new Intl.DateTimeFormat(locale, {
                timeZone: zone,
                timeZoneName: "short",
            })
                .formatToParts(toInstant(toZoned(value, zone)))
                .find((part) => part.type === "timeZoneName")?.value;
        const winter = toZoned(at(2026, 1, 15, 12), "America/New_York");
        const summer = toZoned(at(2026, 7, 15, 12), "America/New_York");
        expect(formatTimeZoneName("en-US", winter)).toBe(
            name("America/New_York", at(2026, 1, 15, 12)),
        );
        expect(formatTimeZoneName("en-US", summer)).toBe(
            name("America/New_York", at(2026, 7, 15, 12)),
        );
        expect(formatTimeZoneName("en-US", winter)).not.toBe(
            formatTimeZoneName("en-US", summer),
        );
    });

    it("gives a field its zone: resolve, convert, instants, names and ISO", () => {
        const zone = timeZone("America/New_York");
        expect(zone.id).toBe("America/New_York");
        expect(zone.resolve(at(2026, 3, 8, 2, 30), "earlier").hour).toBe(1);
        expect(zone.resolve(at(2026, 3, 8, 2, 30)).hour).toBe(3);
        const kolkata = toZoned(at(2026, 11, 20, 21), "Asia/Kolkata");
        expect(zone.convert(kolkata)).toMatchObject({ hour: 10, minute: 30 });
        expect(zone.at(Date.UTC(2026, 10, 20, 15, 30)).hour).toBe(10);
        expect(zone.name("en-US", zone.at(0))).toBe(
            formatTimeZoneName("en-US", zone.at(0)),
        );
        expect(zone.toIso(zone.at(Date.UTC(2026, 10, 20, 15, 30)))).toBe(
            "2026-11-20T10:30-05:00[America/New_York]",
        );
        expect(timeZone().id).toBe(localTimeZone());
    });
});
