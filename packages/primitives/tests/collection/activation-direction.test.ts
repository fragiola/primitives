import { describe, expect, it } from "vitest";
import { activationDirection } from "../../src/collection/activation-direction.ts";

function at(left: number, top: number): Element {
    const element = document.createElement("button");
    element.getBoundingClientRect = () => new DOMRect(left, top, 80, 32);
    return element;
}

// spec/tabs.md, `data-activation-direction` (Epic #32)
describe("activationDirection", () => {
    it("is left or right along a horizontal list, by position (physical)", () => {
        expect(activationDirection(at(0, 0), at(100, 0), "horizontal")).toBe(
            "right",
        );
        expect(activationDirection(at(100, 0), at(0, 0), "horizontal")).toBe(
            "left",
        );
    });

    it("is up or down along a vertical list", () => {
        expect(activationDirection(at(0, 0), at(0, 40), "vertical")).toBe(
            "down",
        );
        expect(activationDirection(at(0, 40), at(0, 0), "vertical")).toBe("up");
    });

    it("is none without both tabs, for the same tab, or at the same place", () => {
        const tab = at(0, 0);
        expect(activationDirection(null, tab, "horizontal")).toBe("none");
        expect(activationDirection(tab, undefined, "horizontal")).toBe("none");
        expect(activationDirection(tab, tab, "horizontal")).toBe("none");
        expect(activationDirection(at(0, 0), at(0, 40), "horizontal")).toBe(
            "none",
        );
    });
});
