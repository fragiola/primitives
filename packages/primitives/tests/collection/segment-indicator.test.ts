import { afterEach, describe, expect, it } from "vitest";
import {
    placeSegmentIndicator,
    segmentIndicatorBox,
} from "../../src/collection/segment-indicator.ts";

afterEach(() => {
    document.body.innerHTML = "";
});

/** A Root at (10, 20), 300 × 40 with a 2 px border, its second Item checked at (112, 24), 80 × 32. */
function page(): {
    root: HTMLElement;
    item: HTMLElement;
    indicator: HTMLElement;
} {
    document.body.innerHTML = `
        <div data-primitives-part="segmented-control-root" role="radiogroup">
            <span id="indicator"><script></script></span>
            <button data-primitives-part="segmented-control-item" aria-checked="false">A</button>
            <button data-primitives-part="segmented-control-item" aria-checked="true">B</button>
        </div>`;
    const root = document.querySelector(
        '[data-primitives-part="segmented-control-root"]',
    ) as HTMLElement;
    const item = document.querySelectorAll("button")[1] as HTMLElement;
    root.getBoundingClientRect = () => new DOMRect(10, 20, 300, 40);
    item.getBoundingClientRect = () => new DOMRect(112, 24, 80, 32);
    for (const [name, value] of [
        ["clientLeft", 2],
        ["clientTop", 2],
        ["clientWidth", 296],
        ["clientHeight", 36],
    ] as const) {
        Object.defineProperty(root, name, { value });
    }
    return {
        root,
        item,
        indicator: document.getElementById("indicator") as HTMLElement,
    };
}

// spec/segmented-control.md, "API": the Indicator's variables, from the Root's padding box
describe("segmentIndicatorBox", () => {
    it("measures the Item from the Root's padding edges", () => {
        const { root, item } = page();
        expect(segmentIndicatorBox(root, item, false)).toEqual({
            "--segment-indicator-inset-inline-start": "100px",
            "--segment-indicator-inset-block-start": "2px",
            "--segment-indicator-inline-size": "80px",
            "--segment-indicator-block-size": "32px",
            "--segment-indicator-left": "100px",
            "--segment-indicator-right": "116px",
            "--segment-indicator-top": "2px",
            "--segment-indicator-bottom": "2px",
            "--segment-indicator-width": "80px",
            "--segment-indicator-height": "32px",
        });
    });

    it("measures the inline start from the right padding edge in RTL", () => {
        const { root, item } = page();
        const box = segmentIndicatorBox(root, item, true);
        expect(box["--segment-indicator-inset-inline-start"]).toBe("116px");
        expect(box["--segment-indicator-left"]).toBe("100px");
    });
});

// spec/segmented-control.md, "Server rendering"
describe("placeSegmentIndicator", () => {
    it("sets the checked Item's box on the Indicator and removes its script", () => {
        const { root, item, indicator } = page();
        placeSegmentIndicator(indicator.querySelector("script"));
        expect(indicator.querySelector("script")).toBeNull();
        for (const [name, value] of Object.entries(
            segmentIndicatorBox(root, item, false),
        )) {
            expect(indicator.style.getPropertyValue(name)).toBe(value);
        }
    });

    it("measures from the right edge in RTL", () => {
        const { root, indicator } = page();
        root.dir = "rtl";
        placeSegmentIndicator(indicator.querySelector("script"));
        expect(
            indicator.style.getPropertyValue(
                "--segment-indicator-inset-inline-start",
            ),
        ).toBe("116px");
    });

    it("sets nothing while no Item is checked, and still removes its script", () => {
        const { indicator } = page();
        for (const item of document.querySelectorAll("button")) {
            item.setAttribute("aria-checked", "false");
        }
        placeSegmentIndicator(indicator.querySelector("script"));
        expect(indicator.querySelector("script")).toBeNull();
        expect(indicator.getAttribute("style")).toBeNull();
    });

    it("is self-contained: its source runs on its own", () => {
        const { indicator } = page();
        new Function("script", `(${placeSegmentIndicator.toString()})(script)`)(
            indicator.querySelector("script"),
        );
        expect(
            indicator.style.getPropertyValue("--segment-indicator-width"),
        ).toBe("80px");
    });
});
