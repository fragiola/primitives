import { expect, type Locator, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";
import {
    scrollbar,
    scrollMetrics,
    scrollRoot,
    scrollViewportTo,
    thumb,
    viewport,
} from "../../src/scroll-area.ts";

// spec/scroll-area.md: anatomy, the structural styles, the overflow attributes and the CSS
// variables (the thumbs' sizes are layout: compared as variables here, as pixels in CI's
// screenshots only)

/** An inline style property of an element. */
const inline = (locator: Locator, name: string) =>
    locator.evaluate(
        (element, property) =>
            (element as HTMLElement).style.getPropertyValue(property),
        name,
    );

const OVERFLOW = [
    "data-has-overflow-x",
    "data-has-overflow-y",
    "data-overflow-x-start",
    "data-overflow-x-end",
    "data-overflow-y-start",
    "data-overflow-y-end",
];

/** The overflow attributes present on an element. */
const overflowOf = (locator: Locator) =>
    locator.evaluate(
        (element, names) => names.filter((name) => element.hasAttribute(name)),
        OVERFLOW,
    );

test("scroll area / basic: parts, roles and structural styles", async ({
    page,
}) => {
    await openScenario(page, "/scroll-area/basic");
    const root = scrollRoot(page, "Changelog");
    await expect(root).toHaveAttribute("role", "presentation");
    expect(await inline(root, "position")).toBe("relative");
    const view = part(root, "scroll-area", "viewport");
    await expect(view).toHaveCount(1);
    expect(await inline(view, "overflow")).toBe("scroll");
    expect(await inline(view, "scrollbar-width")).toBe("none");
    const content = part(view, "scroll-area", "content");
    await expect(content).toHaveAttribute("role", "presentation");
    expect(await inline(content, "min-width")).toBe("fit-content");

    const vertical = scrollbar(root, "vertical");
    const horizontal = scrollbar(root, "horizontal");
    for (const bar of [vertical, horizontal]) {
        await expect(bar).toHaveAttribute("aria-hidden", "true");
        expect(await inline(bar, "position")).toBe("absolute");
        expect(await inline(bar, "touch-action")).toBe("none");
        expect(await inline(bar, "user-select")).toBe("none");
        expect(await inline(bar, "visibility")).toBe("");
    }
    expect(await inline(vertical, "top")).toBe("0px");
    expect(await inline(vertical, "bottom")).toBe(
        "var(--scroll-area-corner-height)",
    );
    expect(await inline(vertical, "inset-inline-end")).toBe("0px");
    expect(await inline(horizontal, "inset-inline-start")).toBe("0px");
    expect(await inline(horizontal, "inset-inline-end")).toBe(
        "var(--scroll-area-corner-width)",
    );
    expect(await inline(horizontal, "bottom")).toBe("0px");
    await expect(thumb(vertical)).toHaveAttribute(
        "data-orientation",
        "vertical",
    );
    await expect(thumb(horizontal)).toHaveAttribute(
        "data-orientation",
        "horizontal",
    );
    expect(await inline(thumb(vertical), "height")).toBe(
        "var(--scroll-area-thumb-height)",
    );
    expect(await inline(thumb(horizontal), "width")).toBe(
        "var(--scroll-area-thumb-width)",
    );
    expect(await inline(thumb(vertical), "transform")).toBe(
        "translate3d(0px, 0px, 0px)",
    );

    const corner = part(root, "scroll-area", "corner");
    await expect(corner).toHaveAttribute("aria-hidden", "true");
    expect(await inline(corner, "position")).toBe("absolute");
    expect(await inline(corner, "bottom")).toBe("0px");
    expect(await inline(corner, "inset-inline-end")).toBe("0px");
    expect(await inline(corner, "width")).toBe(
        "var(--scroll-area-corner-width)",
    );
    expect(await inline(corner, "height")).toBe(
        "var(--scroll-area-corner-height)",
    );
    await expectNoFalseStates(parts(page, "scroll-area"));
});

test("scroll area / basic: the overflow attributes and variables follow the scroll", async ({
    page,
}) => {
    await openScenario(page, "/scroll-area/basic");
    const root = scrollRoot(page, "Changelog");
    const view = viewport(page, "Changelog");
    const content = part(view, "scroll-area", "content");
    const vertical = scrollbar(root, "vertical");
    const horizontal = scrollbar(root, "horizontal");
    const atRest = [
        "data-has-overflow-x",
        "data-has-overflow-y",
        "data-overflow-x-end",
        "data-overflow-y-end",
    ];
    for (const element of [root, view, content, vertical, horizontal]) {
        await expect.poll(() => overflowOf(element)).toEqual(atRest);
    }
    const metrics = await scrollMetrics(view);
    expect(await inline(view, "--scroll-area-overflow-y-start")).toBe("0px");
    expect(await inline(view, "--scroll-area-overflow-y-end")).toBe(
        `${metrics.maxY}px`,
    );
    expect(await inline(view, "--scroll-area-overflow-x-end")).toBe(
        `${metrics.maxX}px`,
    );

    // a programmatic scroll: the edges move, `data-scrolling` stays away
    await scrollViewportTo(view, { top: 100 });
    await expect(root).toHaveAttribute("data-overflow-y-start", "");
    await expect(root).toHaveAttribute("data-overflow-y-end", "");
    expect(await inline(view, "--scroll-area-overflow-y-start")).toBe("100px");
    expect(await inline(view, "--scroll-area-overflow-y-end")).toBe(
        `${metrics.maxY - 100}px`,
    );
    await scrollViewportTo(view, { top: metrics.maxY, left: metrics.maxX });
    const atEnd = [
        "data-has-overflow-x",
        "data-has-overflow-y",
        "data-overflow-x-start",
        "data-overflow-y-start",
    ];
    for (const element of [root, view, content, vertical, horizontal]) {
        await expect.poll(() => overflowOf(element)).toEqual(atEnd);
    }
    expect(
        await parts(root, "scroll-area").evaluateAll(
            (elements) =>
                elements.filter((element) =>
                    element.hasAttribute("data-scrolling"),
                ).length,
        ),
    ).toBe(0);

    // the thumb's size is its scrollbar's variable; the corner's, the root's
    const thumbHeight = await thumb(vertical).evaluate(
        (element) => element.getBoundingClientRect().height,
    );
    expect(
        Number.parseFloat(await inline(vertical, "--scroll-area-thumb-height")),
    ).toBeCloseTo(thumbHeight, 1);
    const barWidth = await vertical.evaluate(
        (element) => (element as HTMLElement).offsetWidth,
    );
    const barHeight = await horizontal.evaluate(
        (element) => (element as HTMLElement).offsetHeight,
    );
    expect(await inline(root, "--scroll-area-corner-width")).toBe(
        `${barWidth}px`,
    );
    expect(await inline(root, "--scroll-area-corner-height")).toBe(
        `${barHeight}px`,
    );
});

test("scroll area / basic: `data-scrolling` while the user scrolls, `data-hovering` while the pointer is over it", async ({
    page,
}) => {
    await openScenario(page, "/scroll-area/basic");
    const root = scrollRoot(page, "Changelog");
    const view = viewport(page, "Changelog");
    const vertical = scrollbar(root, "vertical");
    const horizontal = scrollbar(root, "horizontal");
    await expect(vertical).not.toHaveAttribute("data-hovering");
    await view.hover();
    await expect(vertical).toHaveAttribute("data-hovering", "");
    await expect(horizontal).toHaveAttribute("data-hovering", "");
    await page.mouse.wheel(0, 200);
    await expect(root).toHaveAttribute("data-scrolling", "");
    await expect(view).toHaveAttribute("data-scrolling", "");
    await expect(vertical).toHaveAttribute("data-scrolling", "");
    await expect(thumb(vertical)).toHaveAttribute("data-scrolling", "");
    await expect(horizontal).not.toHaveAttribute("data-scrolling");
    await expect(thumb(horizontal)).not.toHaveAttribute("data-scrolling");
    // gone 500 ms after the last scroll
    await expect(root).not.toHaveAttribute("data-scrolling", {
        timeout: 3000,
    });
    await expect(thumb(vertical)).not.toHaveAttribute("data-scrolling");
    await page.mouse.move(0, 0);
    await expect(vertical).not.toHaveAttribute("data-hovering");
    await expectNoFalseStates(parts(page, "scroll-area"));
});

test("scroll area / basic: the viewport's tab stop, and an area with nothing to scroll", async ({
    page,
}) => {
    await openScenario(page, "/scroll-area/basic");
    await expect(viewport(page, "Changelog")).toHaveAttribute("tabindex", "0");
    const quiet = scrollRoot(page, "Shortcuts");
    await expect(viewport(page, "Shortcuts")).not.toHaveAttribute("tabindex");
    await expect(part(quiet, "scroll-area", "scrollbar")).toHaveCount(0);
    await expect(part(quiet, "scroll-area", "corner")).toHaveCount(0);
    await expect.poll(() => overflowOf(quiet)).toEqual([]);
    expect(
        await inline(
            viewport(page, "Shortcuts"),
            "--scroll-area-overflow-y-end",
        ),
    ).toBe("0px");
    expect(await inline(quiet, "--scroll-area-corner-width")).toBe("0px");
});

test("scroll area / basic?dir=rtl: the x edges are logical", async ({
    page,
}) => {
    await openScenario(page, "/scroll-area/basic", { dir: "rtl" });
    const root = scrollRoot(page, "Changelog");
    const view = viewport(page, "Changelog");
    await expect(root).toHaveAttribute("data-overflow-x-end", "");
    await expect(root).not.toHaveAttribute("data-overflow-x-start");
    await scrollViewportTo(view, { left: -100 });
    await expect(root).toHaveAttribute("data-overflow-x-start", "");
    expect(await inline(view, "--scroll-area-overflow-x-start")).toBe("100px");
    const transform = await inline(
        thumb(scrollbar(root, "horizontal")),
        "transform",
    );
    expect(transform).toMatch(/^translate3d\(-[\d.]+px, 0px, 0px\)$/);
});

test("scroll area / links: a viewport with focusable content takes no tab stop", async ({
    page,
}) => {
    await openScenario(page, "/scroll-area/links");
    const root = scrollRoot(page, "Chapters");
    await expect(viewport(page, "Chapters")).not.toHaveAttribute("tabindex");
    await expect(scrollbar(root, "vertical")).toHaveCount(1);
    await expect(scrollbar(root, "horizontal")).toHaveCount(0);
    await expect(root).toHaveAttribute("data-has-overflow-y", "");
    await expect(root).not.toHaveAttribute("data-has-overflow-x");
    await expectNoFalseStates(parts(page, "scroll-area"));
});
