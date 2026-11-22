import { describe, expect, it } from "vitest";
import { getDirection } from "../../src/direction/direction.ts";

describe("getDirection (spec/direction.md)", () => {
    it("takes the provided direction over the computed one", () => {
        document.body.innerHTML = `<div dir="rtl"><span></span></div>`;
        const span = document.querySelector("span") as HTMLElement;
        expect(getDirection(span, "ltr")).toBe("ltr");
        document.body.innerHTML = `<div><span></span></div>`;
        const plain = document.querySelector("span") as HTMLElement;
        expect(getDirection(plain, "rtl")).toBe("rtl");
    });

    it("falls back to the computed direction", () => {
        document.body.innerHTML = `<div style="direction: rtl"><span></span></div>`;
        const span = document.querySelector("span") as HTMLElement;
        expect(getDirection(span)).toBe("rtl");
        expect(getDirection(span, null)).toBe("rtl");
    });
});
