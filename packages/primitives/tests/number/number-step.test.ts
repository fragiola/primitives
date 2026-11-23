import { describe, expect, it } from "vitest";
import { clampNumber, stepNumber } from "../../src/number/number-step.ts";

// spec/number-field.md, "Stepping"
describe("stepNumber", () => {
    it("steps by the amount, clamped to the bounds", () => {
        expect(stepNumber(1, 1, { min: 1, max: 10 })).toBe(2);
        expect(stepNumber(9, 5, { min: 1, max: 10 })).toBe(10);
        expect(stepNumber(1, -1, { min: 1, max: 10 })).toBe(1);
        expect(stepNumber(5, -10)).toBe(-5);
    });

    it("leaves no floating-point noise", () => {
        expect(stepNumber(0.1, 0.2)).toBe(0.3);
        expect(stepNumber(1.1, 0.1)).toBe(1.2);
        expect(stepNumber(0.3, -0.1)).toBe(0.2);
    });

    it("starts an empty field at 0, clamped, with no step", () => {
        expect(stepNumber(null, 1)).toBe(0);
        expect(stepNumber(null, 1, { min: 1, max: 10 })).toBe(1);
        expect(stepNumber(null, -1, { min: -10, max: -2 })).toBe(-2);
    });

    it("snaps a value off the grid to the next grid point in the step's direction", () => {
        expect(stepNumber(1.5, 1, { snapOnStep: true })).toBe(2);
        expect(stepNumber(1.5, -1, { snapOnStep: true })).toBe(1);
        expect(stepNumber(2, 1, { snapOnStep: true })).toBe(3);
        expect(stepNumber(2, -1, { snapOnStep: true })).toBe(1);
        // the grid counts from min
        expect(stepNumber(4, 5, { min: 2, snapOnStep: true })).toBe(7);
        expect(stepNumber(0.31, 0.1, { snapOnStep: true })).toBe(0.4);
        expect(stepNumber(0.3, 0.1, { snapOnStep: true })).toBe(0.4);
        expect(stepNumber(1.5, 1)).toBe(2.5);
    });
});

describe("clampNumber", () => {
    it("clamps to the bounds it has", () => {
        expect(clampNumber(12, 1, 10)).toBe(10);
        expect(clampNumber(-1, 0, undefined)).toBe(0);
        expect(clampNumber(99, undefined, undefined)).toBe(99);
    });
});
