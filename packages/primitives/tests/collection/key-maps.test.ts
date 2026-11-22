import { describe, expect, it } from "vitest";
import {
    accordionKeyTarget,
    menuKeyTarget,
    radioKeyTarget,
    submenuKeys,
    tabsKeyTarget,
} from "../../src/collection/key-maps.ts";

describe("tabsKeyTarget", () => {
    const horizontal = {
        orientation: "horizontal" as const,
        rtl: false,
        loop: true,
    };
    it("moves along the orientation, mirrored in RTL, and wraps", () => {
        expect(tabsKeyTarget("ArrowRight", 0, 4, horizontal)).toBe(1);
        expect(tabsKeyTarget("ArrowRight", 3, 4, horizontal)).toBe(0);
        expect(
            tabsKeyTarget("ArrowLeft", 0, 4, { ...horizontal, rtl: true }),
        ).toBe(1);
        expect(
            tabsKeyTarget("ArrowDown", 0, 4, {
                ...horizontal,
                orientation: "vertical",
            }),
        ).toBe(1);
        expect(
            tabsKeyTarget("ArrowRight", 0, 4, {
                ...horizontal,
                orientation: "vertical",
            }),
        ).toBeNull();
        expect(tabsKeyTarget("End", 0, 4, horizontal)).toBe(3);
        expect(tabsKeyTarget("Enter", 0, 4, horizontal)).toBeNull();
    });
});

describe("menuKeyTarget and submenuKeys", () => {
    it("moves through items and knows the submenu keys", () => {
        expect(menuKeyTarget("ArrowDown", -1, 3, { loop: true })).toBe(0);
        expect(menuKeyTarget("ArrowUp", 0, 3, { loop: true })).toBe(2);
        expect(menuKeyTarget("ArrowUp", 0, 3, { loop: false })).toBe(0);
        expect(menuKeyTarget("Home", 2, 3, { loop: true })).toBe(0);
        expect(menuKeyTarget("x", 0, 3, { loop: true })).toBeNull();
        expect(submenuKeys(false)).toEqual({
            open: "ArrowRight",
            close: "ArrowLeft",
        });
        expect(submenuKeys(true)).toEqual({
            open: "ArrowLeft",
            close: "ArrowRight",
        });
    });
});

describe("radioKeyTarget", () => {
    const ltr = { rtl: false, loop: true };
    it("moves to the next radio with ArrowDown and ArrowRight, the previous with ArrowUp and ArrowLeft", () => {
        expect(radioKeyTarget("ArrowDown", 0, 4, ltr)).toBe(1);
        expect(radioKeyTarget("ArrowRight", 0, 4, ltr)).toBe(1);
        expect(radioKeyTarget("ArrowUp", 2, 4, ltr)).toBe(1);
        expect(radioKeyTarget("ArrowLeft", 2, 4, ltr)).toBe(1);
    });

    it("wraps at the ends with loop, and stops there without it", () => {
        expect(radioKeyTarget("ArrowDown", 3, 4, ltr)).toBe(0);
        expect(radioKeyTarget("ArrowUp", 0, 4, ltr)).toBe(3);
        expect(
            radioKeyTarget("ArrowDown", 3, 4, { ...ltr, loop: false }),
        ).toBeNull();
        expect(
            radioKeyTarget("ArrowLeft", 0, 4, { ...ltr, loop: false }),
        ).toBeNull();
        expect(
            radioKeyTarget("ArrowRight", 0, 4, { ...ltr, loop: false }),
        ).toBe(1);
    });

    it("swaps ArrowLeft and ArrowRight in RTL, not ArrowDown and ArrowUp", () => {
        const rtl = { rtl: true, loop: true };
        expect(radioKeyTarget("ArrowLeft", 0, 4, rtl)).toBe(1);
        expect(radioKeyTarget("ArrowRight", 1, 4, rtl)).toBe(0);
        expect(radioKeyTarget("ArrowDown", 0, 4, rtl)).toBe(1);
        expect(radioKeyTarget("ArrowUp", 1, 4, rtl)).toBe(0);
    });

    it("skips the disabled radios", () => {
        const skip = (index: number) => index === 2;
        expect(radioKeyTarget("ArrowDown", 1, 4, { ...ltr, skip })).toBe(3);
        expect(radioKeyTarget("ArrowUp", 3, 4, { ...ltr, skip })).toBe(1);
        // the only enabled radio: nowhere to go
        expect(
            radioKeyTarget("ArrowDown", 0, 3, { ...ltr, skip: (i) => i !== 0 }),
        ).toBeNull();
    });

    it("ignores the other keys", () => {
        for (const key of ["Home", "End", "Enter", " ", "Tab", "a"]) {
            expect(radioKeyTarget(key, 0, 4, ltr)).toBeNull();
        }
    });
});

// spec/accordion.md, "Keyboard" (Epic #32)
describe("accordionKeyTarget", () => {
    const vertical = {
        orientation: "vertical",
        rtl: false,
        loop: true,
    } as const;
    it("moves along the orientation, wraps with loop, Home and End", () => {
        expect(accordionKeyTarget("ArrowDown", 0, 3, vertical)).toBe(1);
        expect(accordionKeyTarget("ArrowUp", 0, 3, vertical)).toBe(2);
        expect(accordionKeyTarget("ArrowRight", 0, 3, vertical)).toBeNull();
        expect(accordionKeyTarget("Home", 2, 3, vertical)).toBe(0);
        expect(accordionKeyTarget("End", 0, 3, vertical)).toBe(2);
    });

    it("mirrors the horizontal arrows in RTL and stops at the ends without loop", () => {
        const options = {
            orientation: "horizontal",
            rtl: true,
            loop: false,
        } as const;
        expect(accordionKeyTarget("ArrowLeft", 0, 3, options)).toBe(1);
        expect(accordionKeyTarget("ArrowRight", 0, 3, options)).toBe(0);
        expect(accordionKeyTarget("ArrowLeft", 2, 3, options)).toBe(2);
        expect(accordionKeyTarget("ArrowDown", 0, 3, options)).toBeNull();
    });
});
