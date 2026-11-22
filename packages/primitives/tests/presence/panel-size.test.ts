import { afterEach, describe, expect, it, vi } from "vitest";
import {
    freezePanelSize,
    measurePanelSize,
    panelSizeVariables,
    watchBeforeMatch,
} from "../../src/presence/panel-size.ts";
import { isAnimating } from "../../src/presence/presence.ts";

afterEach(() => {
    document.body.innerHTML = "";
    vi.useRealTimers();
});

function panel(height = 120, width = 300): HTMLElement {
    const element = document.createElement("div");
    Object.defineProperty(element, "scrollHeight", { value: height });
    Object.defineProperty(element, "scrollWidth", { value: width });
    document.body.append(element);
    return element;
}

// spec/collapsible.md, "Animation" and "Find in page" (Epic #32)
describe("measurePanelSize", () => {
    it("reads the content's scroll size", () => {
        expect(measurePanelSize(panel())).toEqual({ height: 120, width: 300 });
    });
});

describe("freezePanelSize", () => {
    it("writes the size variables in pixels and returns the size", () => {
        const element = panel();
        expect(freezePanelSize(element, "collapsible")).toEqual({
            height: 120,
            width: 300,
        });
        expect(
            element.style.getPropertyValue("--collapsible-panel-height"),
        ).toBe("120px");
        expect(
            element.style.getPropertyValue("--collapsible-panel-width"),
        ).toBe("300px");
    });

    it("applies the styles at once", () => {
        const element = panel();
        const spy = vi.spyOn(window, "getComputedStyle");
        freezePanelSize(element, "accordion");
        expect(spy).toHaveBeenCalledWith(element);
        expect(element.style.getPropertyValue("--accordion-panel-height")).toBe(
            "120px",
        );
        spy.mockRestore();
    });
});

describe("panelSizeVariables", () => {
    it("is auto with no size, else pixels", () => {
        expect(panelSizeVariables("collapsible", null)).toEqual({
            "--collapsible-panel-height": "auto",
            "--collapsible-panel-width": "auto",
        });
        expect(
            panelSizeVariables("accordion", { height: 40, width: 10 }),
        ).toEqual({
            "--accordion-panel-height": "40px",
            "--accordion-panel-width": "10px",
        });
    });
});

describe("watchBeforeMatch", () => {
    it("reports a match and leaves an opened panel shown", () => {
        vi.useFakeTimers();
        const element = panel();
        const onMatch = vi.fn();
        watchBeforeMatch(element, { onMatch, isOpen: () => true });
        element.dispatchEvent(new Event("beforematch"));
        expect(onMatch).toHaveBeenCalledTimes(1);
        vi.runAllTimers();
        expect(element.hasAttribute("hidden")).toBe(false);
    });

    it("hides a panel the app kept closed again, a task later", () => {
        vi.useFakeTimers();
        const element = panel();
        watchBeforeMatch(element, { onMatch: () => {}, isOpen: () => false });
        element.dispatchEvent(new Event("beforematch"));
        expect(element.hasAttribute("hidden")).toBe(false);
        vi.runAllTimers();
        expect(element.getAttribute("hidden")).toBe("until-found");
    });

    it("stops listening on cleanup", () => {
        vi.useFakeTimers();
        const element = panel();
        const onMatch = vi.fn();
        const stop = watchBeforeMatch(element, {
            onMatch,
            isOpen: () => false,
        });
        stop();
        element.dispatchEvent(new Event("beforematch"));
        vi.runAllTimers();
        expect(onMatch).not.toHaveBeenCalled();
        expect(element.hasAttribute("hidden")).toBe(false);
    });
});

describe("isAnimating", () => {
    it("is false with nothing running, or without getAnimations", () => {
        const element = panel();
        expect(isAnimating(element)).toBe(false);
        Object.defineProperty(element, "getAnimations", {
            value: () => [{}],
        });
        expect(isAnimating(element)).toBe(true);
    });
});
