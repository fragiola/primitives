import { describe, expect, it } from "vitest";
import { segmentFormat } from "../../src/segments/segment-format.ts";
import { segmentKeyDown } from "../../src/segments/segment-keys.ts";

const format = segmentFormat({ locale: "en-US", kind: "date" });

// spec/date-field.md, "Keyboard" (the APG spinbutton)
describe("segmentKeyDown", () => {
    it("steps with the arrows and the page keys, and goes to the edges", () => {
        const values = { month: 11 };
        const stepped = (key: string) =>
            segmentKeyDown(format, values, "month", key, null)?.values;
        expect(stepped("ArrowUp")).toEqual({ month: 12 });
        expect(stepped("ArrowDown")).toEqual({ month: 10 });
        expect(stepped("PageUp")).toEqual({ month: 1 });
        expect(stepped("PageDown")).toEqual({ month: 9 });
        expect(stepped("Home")).toEqual({ month: 1 });
        expect(stepped("End")).toEqual({ month: 12 });
        expect(
            segmentKeyDown(format, { year: 2026 }, "year", "PageUp", null)
                ?.values,
        ).toEqual({ year: 2031 });
    });

    it("moves with ArrowLeft and ArrowRight, also when read-only", () => {
        expect(
            segmentKeyDown(format, {}, "day", "ArrowLeft", null),
        ).toMatchObject({
            kind: "move",
            move: "left",
        });
        expect(
            segmentKeyDown(format, {}, "day", "ArrowRight", null, {
                readOnly: true,
            }),
        ).toMatchObject({ kind: "move", move: "right" });
        expect(
            segmentKeyDown(format, { day: 3 }, "day", "ArrowUp", null, {
                readOnly: true,
            }),
        ).toBeNull();
    });

    it("erases with Backspace and Delete, moving back from an empty segment", () => {
        expect(
            segmentKeyDown(format, { day: 23 }, "day", "Backspace", null),
        ).toEqual({
            kind: "erase",
            values: { day: 2 },
            edit: { type: "day", text: "2" },
            move: null,
        });
        expect(segmentKeyDown(format, {}, "day", "Delete", null)?.move).toBe(
            "previous",
        );
    });

    it("seeds a placeholder from the seed", () => {
        expect(
            segmentKeyDown(format, {}, "year", "ArrowUp", null, {
                seed: { year: 2026 },
            })?.values,
        ).toEqual({ year: 2026 });
    });

    it("ignores the other keys", () => {
        expect(segmentKeyDown(format, {}, "day", "a", null)).toBeNull();
        expect(segmentKeyDown(format, {}, "day", "Tab", null)).toBeNull();
    });
});
