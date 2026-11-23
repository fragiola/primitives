import { describe, expect, it } from "vitest";
import {
    type RatingKeyOptions,
    ratingItemState,
    ratingKeyTarget,
    ratingValueAt,
} from "../../src/range/rating.ts";

const WHOLE: RatingKeyOptions = {
    count: 5,
    allowHalf: false,
    rtl: false,
    loop: true,
};
const HALF: RatingKeyOptions = { ...WHOLE, allowHalf: true };

// spec/rating.md, "Keyboard"
describe("ratingKeyTarget", () => {
    it("steps by 1 up with ArrowRight and ArrowDown, down with ArrowLeft and ArrowUp", () => {
        expect(ratingKeyTarget("ArrowRight", 2, WHOLE)).toBe(3);
        expect(ratingKeyTarget("ArrowDown", 2, WHOLE)).toBe(3);
        expect(ratingKeyTarget("ArrowLeft", 2, WHOLE)).toBe(1);
        expect(ratingKeyTarget("ArrowUp", 2, WHOLE)).toBe(1);
    });

    it("steps by 0.5 with allowHalf, from a half or a whole value", () => {
        expect(ratingKeyTarget("ArrowRight", 2.5, HALF)).toBe(3);
        expect(ratingKeyTarget("ArrowRight", 3, HALF)).toBe(3.5);
        expect(ratingKeyTarget("ArrowLeft", 2.5, HALF)).toBe(2);
        expect(ratingKeyTarget("ArrowLeft", 2, HALF)).toBe(1.5);
    });

    it("goes from 0 to the first step, never back to 0", () => {
        expect(ratingKeyTarget("ArrowRight", 0, WHOLE)).toBe(1);
        expect(ratingKeyTarget("ArrowRight", 0, HALF)).toBe(0.5);
        expect(ratingKeyTarget("ArrowLeft", 1, { ...WHOLE, loop: false })).toBe(
            null,
        );
        expect(
            ratingKeyTarget("ArrowLeft", 0.5, { ...HALF, loop: false }),
        ).toBe(null);
    });

    it("wraps between the first step and count with loop, stops without", () => {
        expect(ratingKeyTarget("ArrowRight", 5, WHOLE)).toBe(1);
        expect(ratingKeyTarget("ArrowRight", 5, HALF)).toBe(0.5);
        expect(ratingKeyTarget("ArrowLeft", 1, WHOLE)).toBe(5);
        expect(ratingKeyTarget("ArrowLeft", 0.5, HALF)).toBe(5);
        expect(ratingKeyTarget("ArrowLeft", 0, WHOLE)).toBe(5);
        expect(
            ratingKeyTarget("ArrowRight", 5, { ...WHOLE, loop: false }),
        ).toBe(null);
        expect(ratingKeyTarget("ArrowLeft", 0, { ...WHOLE, loop: false })).toBe(
            null,
        );
    });

    it("Home is the first step, End is count; null when already there", () => {
        expect(ratingKeyTarget("Home", 3, WHOLE)).toBe(1);
        expect(ratingKeyTarget("Home", 3, HALF)).toBe(0.5);
        expect(ratingKeyTarget("End", 3, HALF)).toBe(5);
        expect(ratingKeyTarget("End", 5, HALF)).toBe(null);
        expect(ratingKeyTarget("Home", 1, WHOLE)).toBe(null);
    });

    it("swaps ArrowLeft and ArrowRight in RTL, not ArrowUp and ArrowDown", () => {
        const rtl = { ...WHOLE, rtl: true };
        expect(ratingKeyTarget("ArrowLeft", 2, rtl)).toBe(3);
        expect(ratingKeyTarget("ArrowRight", 2, rtl)).toBe(1);
        expect(ratingKeyTarget("ArrowDown", 2, rtl)).toBe(3);
        expect(ratingKeyTarget("ArrowUp", 2, rtl)).toBe(1);
    });

    it("ignores other keys and an empty scale", () => {
        expect(ratingKeyTarget("Enter", 2, WHOLE)).toBe(null);
        expect(ratingKeyTarget(" ", 2, WHOLE)).toBe(null);
        expect(ratingKeyTarget("PageUp", 2, WHOLE)).toBe(null);
        expect(ratingKeyTarget("ArrowRight", 0, { ...WHOLE, count: 0 })).toBe(
            null,
        );
    });
});

// spec/rating.md, "Pointer"
describe("ratingValueAt", () => {
    it("chooses the star's whole value, or its half on the inline-start half", () => {
        expect(ratingValueAt(3, 0.25, false)).toBe(3);
        expect(ratingValueAt(3, 0.25, true)).toBe(2.5);
        expect(ratingValueAt(3, 0.5, true)).toBe(3);
        expect(ratingValueAt(3, 0.75, true)).toBe(3);
        expect(ratingValueAt(1, 0, true)).toBe(0.5);
    });
});

// spec/rating.md, "API": the Item's state
describe("ratingItemState", () => {
    it("checks the star that holds the value, rounded up", () => {
        expect(ratingItemState(3, 3).checked).toBe(true);
        expect(ratingItemState(3, 2.5).checked).toBe(true);
        expect(ratingItemState(2, 2.5).checked).toBe(false);
        expect(ratingItemState(1, 0).checked).toBe(false);
    });

    it("highlights every star up to the displayed value, the last one half", () => {
        const stars = [1, 2, 3, 4, 5].map((index) =>
            ratingItemState(index, 2.5),
        );
        expect(stars.map((star) => star.highlighted)).toEqual([
            true,
            true,
            true,
            false,
            false,
        ]);
        expect(stars.map((star) => star.half)).toEqual([
            false,
            false,
            true,
            false,
            false,
        ]);
    });

    it("draws the preview, and keeps the check on the value", () => {
        const star4 = ratingItemState(4, 2, 3.5);
        expect(star4).toEqual({
            checked: false,
            highlighted: true,
            half: true,
        });
        expect(ratingItemState(2, 2, 3.5)).toEqual({
            checked: true,
            highlighted: true,
            half: false,
        });
        expect(ratingItemState(1, 0)).toEqual({
            checked: false,
            highlighted: false,
            half: false,
        });
    });
});
