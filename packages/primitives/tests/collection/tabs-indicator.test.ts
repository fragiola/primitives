import { afterEach, describe, expect, it } from "vitest";
import { placeTabsIndicator } from "../../src/collection/tabs-indicator.ts";

afterEach(() => {
    document.body.innerHTML = "";
});

// spec/tabs.md, "Server rendering" (Epic #22): the inline script of a server-rendered Indicator.
describe("placeTabsIndicator", () => {
    const page = () => {
        document.body.innerHTML = `
            <div role="tablist">
                <button role="tab" aria-selected="false">A</button>
                <button role="tab" aria-selected="true">B</button>
                <span id="indicator"><script></script></span>
            </div>`;
        const tabs = document.querySelectorAll('[role="tab"]');
        const list = document.querySelector('[role="tablist"]') as Element;
        list.getBoundingClientRect = () => new DOMRect(10, 20, 300, 40);
        (tabs[1] as Element).getBoundingClientRect = () =>
            new DOMRect(110, 24, 80, 32);
        return document.getElementById("indicator") as HTMLElement;
    };

    it("sets the selected tab's box on the Indicator and removes its script", () => {
        const indicator = page();
        placeTabsIndicator(indicator.querySelector("script"));
        expect(indicator.querySelector("script")).toBeNull();
        expect(
            indicator.style.getPropertyValue(
                "--tabs-indicator-inset-inline-start",
            ),
        ).toBe("100px");
        expect(
            indicator.style.getPropertyValue(
                "--tabs-indicator-inset-block-start",
            ),
        ).toBe("4px");
        expect(
            indicator.style.getPropertyValue("--tabs-indicator-inline-size"),
        ).toBe("80px");
        expect(
            indicator.style.getPropertyValue("--tabs-indicator-block-size"),
        ).toBe("32px");
    });

    it("measures from the list's right edge in RTL", () => {
        const indicator = page();
        (document.querySelector('[role="tablist"]') as HTMLElement).dir = "rtl";
        placeTabsIndicator(indicator.querySelector("script"));
        expect(
            indicator.style.getPropertyValue(
                "--tabs-indicator-inset-inline-start",
            ),
        ).toBe("120px");
    });

    it("is self-contained: its source runs on its own", () => {
        const indicator = page();
        new Function("script", `(${placeTabsIndicator.toString()})(script)`)(
            indicator.querySelector("script"),
        );
        expect(
            indicator.style.getPropertyValue("--tabs-indicator-inline-size"),
        ).toBe("80px");
    });

    it("does nothing without a selected tab", () => {
        const indicator = page();
        document
            .querySelector('[aria-selected="true"]')
            ?.setAttribute("aria-selected", "false");
        placeTabsIndicator(indicator.querySelector("script"));
        expect(indicator.getAttribute("style")).toBeNull();
        placeTabsIndicator(null);
    });
});
