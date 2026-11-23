import { afterEach, describe, expect, it, vi } from "vitest";
import {
    focusOnLabelPress,
    segmentTarget,
} from "../../src/segments/segment-focus.ts";

/** A group of three segments (the middle one disabled when asked), placed at the given lefts. */
function group(lefts: number[] | null, disabledMiddle = false): HTMLElement[] {
    const root = document.createElement("div");
    root.setAttribute("role", "group");
    const segments = ["month", "day", "year"].map((type, index) => {
        const segment = document.createElement("span");
        segment.setAttribute("role", "spinbutton");
        segment.dataset.type = type;
        if (!(disabledMiddle && index === 1)) {
            segment.tabIndex = 0;
        }
        if (lefts !== null) {
            const left = lefts[index] ?? 0;
            segment.getBoundingClientRect = () =>
                ({ left, width: 20, top: 0, height: 20 }) as DOMRect;
        }
        root.append(segment, document.createTextNode("/"));
        return segment;
    });
    document.body.append(root);
    return segments;
}

afterEach(() => {
    document.body.replaceChildren();
});

// spec/date-field.md, "Keyboard": the segments the keys and the typing move to
describe("segmentTarget", () => {
    it("moves in document order for next and previous", () => {
        const [month, day, year] = group([0, 30, 60]);
        expect(segmentTarget(month as HTMLElement, "next")).toBe(day);
        expect(segmentTarget(year as HTMLElement, "previous")).toBe(day);
        expect(segmentTarget(year as HTMLElement, "next")).toBeNull();
        expect(segmentTarget(year as HTMLElement, "first")).toBe(month);
    });

    it("moves on screen for left and right, wherever bidi placed the segments", () => {
        // laid out right to left: month at the right edge
        const [month, day, year] = group([60, 30, 0]);
        expect(segmentTarget(month as HTMLElement, "left")).toBe(day);
        expect(segmentTarget(day as HTMLElement, "left")).toBe(year);
        expect(segmentTarget(day as HTMLElement, "right")).toBe(month);
        expect(segmentTarget(month as HTMLElement, "right")).toBeNull();
    });

    it("falls back to document order with no layout", () => {
        const [month, day] = group(null);
        expect(segmentTarget(month as HTMLElement, "right")).toBe(day);
        expect(segmentTarget(day as HTMLElement, "left")).toBe(month);
    });

    it("skips a segment out of the tab order", () => {
        const [month, , year] = group([0, 30, 60], true);
        expect(segmentTarget(month as HTMLElement, "next")).toBe(year);
        expect(segmentTarget(month as HTMLElement, "right")).toBe(year);
    });
});

describe("focusOnLabelPress", () => {
    it("focuses the target on a press the consumer did not prevent, until stopped", () => {
        const label = document.createElement("label");
        const [month] = group(null);
        document.body.append(label);
        const target = vi.fn(() => month ?? null);
        const stop = focusOnLabelPress(label, target);
        label.click();
        expect(document.activeElement).toBe(month);
        (month as HTMLElement).blur();
        label.addEventListener("click", (event) => event.preventDefault(), {
            capture: true,
        });
        label.click();
        expect(document.activeElement).not.toBe(month);
        stop();
        expect(target).toHaveBeenCalledOnce();
    });
});
