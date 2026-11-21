import { describe, expect, it } from "vitest";
import { fromPlacement, toPlacement } from "../../src/positioning/placement.ts";

describe("placement", () => {
    it("maps logical sides to physical ones by direction", () => {
        expect(toPlacement("bottom", "center", "ltr")).toBe("bottom");
        expect(toPlacement("inline-end", "center", "ltr")).toBe("right");
        expect(toPlacement("inline-end", "center", "rtl")).toBe("left");
        expect(toPlacement("inline-start", "start", "ltr")).toBe("left-start");
        expect(toPlacement("inline-start", "center", "rtl")).toBe("right");
        expect(toPlacement("bottom", "start", "ltr")).toBe("bottom-start");
        expect(toPlacement("bottom", "start", "rtl")).toBe("bottom-end");
    });

    it("keeps physical sides whatever the direction", () => {
        expect(toPlacement("left", "center", "ltr")).toBe("left");
        expect(toPlacement("left", "center", "rtl")).toBe("left");
        expect(toPlacement("right", "start", "rtl")).toBe("right-start");
    });

    it("maps a resolved placement back, naming a horizontal side as it was asked", () => {
        expect(fromPlacement("top", "ltr")).toEqual({
            side: "top",
            align: "center",
        });
        expect(fromPlacement("left", "rtl", "inline-end")).toEqual({
            side: "inline-end",
            align: "center",
        });
        expect(fromPlacement("bottom-end", "rtl")).toEqual({
            side: "bottom",
            align: "start",
        });
        expect(fromPlacement("right-start", "ltr", "inline-end")).toEqual({
            side: "inline-end",
            align: "start",
        });
        // a flipped logical side stays logical
        expect(fromPlacement("left", "ltr", "inline-end")).toEqual({
            side: "inline-start",
            align: "center",
        });
        expect(fromPlacement("right", "rtl", "inline-end")).toEqual({
            side: "inline-start",
            align: "center",
        });
        // a physical side stays physical
        expect(fromPlacement("left", "rtl", "left")).toEqual({
            side: "left",
            align: "center",
        });
        expect(fromPlacement("right", "ltr", "left")).toEqual({
            side: "right",
            align: "center",
        });
    });
});
