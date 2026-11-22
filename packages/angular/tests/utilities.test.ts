import { Injector, runInInjectionContext } from "@angular/core";
import {
    injectDirection,
    provideDirection,
} from "@fragiola/primitives-angular/direction";
import { dataValue, dataValues } from "@fragiola/primitives-angular/render";
import { describe, expect, it } from "vitest";

// Epic #26 (#25): the utility entries, from their public specifiers (spec/README.md "Render
// utilities", spec/direction.md).
describe("@fragiola/primitives-angular/render", () => {
    it("gives the data-* host binding values: an empty attribute, a value, or none", () => {
        expect(dataValue(true)).toBe("");
        expect(dataValue(false)).toBeNull();
        expect(dataValue(null)).toBeNull();
        expect(dataValue("start")).toBe("start");
        expect(
            dataValues({ open: true, disabled: false, side: "top" }),
        ).toEqual({ open: "", disabled: null, side: "top" });
    });
});

describe("@fragiola/primitives-angular/direction", () => {
    const read = (injector: Injector) =>
        runInInjectionContext(injector, () => injectDirection()());

    it("reads ltr without a provider", () => {
        expect(read(Injector.create({ providers: [] }))).toBe("ltr");
    });

    it("reads the provided direction, and a nested provider wins", () => {
        const outer = Injector.create({ providers: [provideDirection("rtl")] });
        expect(read(outer)).toBe("rtl");
        const inner = Injector.create({
            providers: [provideDirection("ltr")],
            parent: outer,
        });
        expect(read(inner)).toBe("ltr");
        const child = Injector.create({ providers: [], parent: outer });
        expect(read(child)).toBe("rtl");
    });
});
