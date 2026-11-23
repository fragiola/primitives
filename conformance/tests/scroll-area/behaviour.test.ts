import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { part } from "../../src/contract.ts";
import { dragFrom } from "../../src/pointer.ts";
import { openScenario } from "../../src/scenario.ts";
import {
    expectThumbFollows,
    scrollbar,
    scrollMetrics,
    scrollRoot,
    thumb,
    trackGeometry,
    viewport,
} from "../../src/scroll-area.ts";

// spec/scroll-area.md
const button = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true });

test.describe("scroll area / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/scroll-area/basic");
    });

    test("overflows on both axes: both scrollbars, the corner, a tab stop, a thumb sized by the view", async ({
        page,
    }) => {
        const root = scrollRoot(page, "Changelog");
        await expect(scrollbar(root, "vertical")).toHaveCount(1);
        await expect(scrollbar(root, "horizontal")).toHaveCount(1);
        await expect(thumb(scrollbar(root, "vertical"))).toHaveCount(1);
        await expect(thumb(scrollbar(root, "horizontal"))).toHaveCount(1);
        await expect(part(root, "scroll-area", "corner")).toHaveCount(1);
        const view = viewport(page, "Changelog");
        await expect(view).toHaveAttribute("tabindex", "0");
        const metrics = await scrollMetrics(view);
        const track = await trackGeometry(scrollbar(root, "vertical"));
        expect(track.thumbSize / track.room).toBeCloseTo(
            metrics.clientHeight / metrics.scrollHeight,
            2,
        );
        const across = await trackGeometry(scrollbar(root, "horizontal"));
        expect(across.thumbSize / across.room).toBeCloseTo(
            metrics.clientWidth / metrics.scrollWidth,
            2,
        );
    });

    test("the keyboard scrolls it natively", async ({ page }) => {
        const view = viewport(page, "Changelog");
        await button(page, "Toggle width").focus();
        await page.keyboard.press("Tab");
        await expect(view).toBeFocused();
        await page.keyboard.press("End");
        await expect
            .poll(async () => {
                const metrics = await scrollMetrics(view);
                return metrics.maxY - metrics.scrollTop;
            })
            .toBeLessThanOrEqual(1);
        await page.keyboard.press("Home");
        await expect
            .poll(async () => (await scrollMetrics(view)).scrollTop)
            .toBe(0);
        await page.keyboard.press("ArrowDown");
        await expect
            .poll(async () => (await scrollMetrics(view)).scrollTop)
            .toBeGreaterThan(0);
    });

    test("the wheel scrolls it, and the thumb follows", async ({ page }) => {
        const root = scrollRoot(page, "Changelog");
        const view = viewport(page, "Changelog");
        await view.hover();
        await page.mouse.wheel(0, 240);
        await expect
            .poll(async () => (await scrollMetrics(view)).scrollTop)
            .toBeGreaterThan(0);
        await expectThumbFollows(view, scrollbar(root, "vertical"));
    });

    test("dragging a thumb scrolls by its share of the room left", async ({
        page,
    }) => {
        const root = scrollRoot(page, "Changelog");
        const view = viewport(page, "Changelog");
        const vertical = scrollbar(root, "vertical");
        const track = await trackGeometry(vertical);
        const box = await thumb(vertical).boundingBox();
        expect(box).not.toBeNull();
        const start = box as NonNullable<typeof box>;
        const free = track.room - track.thumbSize;
        await dragFrom(page, thumb(vertical), {
            x: Math.round(start.x + start.width / 2),
            y: Math.round(start.y + start.height / 2 + free / 2),
        });
        await page.mouse.up();
        const metrics = await scrollMetrics(view);
        expect(Math.abs(metrics.scrollTop - metrics.maxY / 2)).toBeLessThan(
            metrics.maxY * 0.02,
        );
        await expectThumbFollows(view, vertical);

        const horizontal = scrollbar(root, "horizontal");
        const across = await trackGeometry(horizontal);
        const from = await thumb(horizontal).boundingBox();
        expect(from).not.toBeNull();
        const thumbBox = from as NonNullable<typeof from>;
        await dragFrom(page, thumb(horizontal), {
            x: Math.round(
                // the whole room, and past it: the scroll stops at its end
                thumbBox.x +
                    thumbBox.width / 2 +
                    across.room -
                    across.thumbSize +
                    20,
            ),
            y: Math.round(thumbBox.y + thumbBox.height / 2),
        });
        await page.mouse.up();
        await expect
            .poll(async () => {
                const after = await scrollMetrics(view);
                return after.maxX - after.scrollLeft;
            })
            .toBeLessThanOrEqual(1);
    });

    test("a track press puts the thumb's center under the pointer, and moves no focus", async ({
        page,
    }) => {
        const root = scrollRoot(page, "Changelog");
        const vertical = scrollbar(root, "vertical");
        await button(page, "Toggle items").focus();
        const track = await trackGeometry(vertical);
        const bar = await vertical.boundingBox();
        expect(bar).not.toBeNull();
        const x = Math.round(
            (bar as NonNullable<typeof bar>).x +
                (bar as NonNullable<typeof bar>).width / 2,
        );
        const y = Math.round(track.end - track.thumbSize);
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.up();
        await expect
            .poll(async () => {
                const after = await trackGeometry(vertical);
                return Math.abs((after.thumbStart + after.thumbEnd) / 2 - y);
            })
            .toBeLessThanOrEqual(1);
        await expect(button(page, "Toggle items")).toBeFocused();
    });

    test("an area that does not overflow has no scrollbar and no tab stop", async ({
        page,
    }) => {
        const root = scrollRoot(page, "Shortcuts");
        await expect(part(root, "scroll-area", "scrollbar")).toHaveCount(0);
        await expect(part(root, "scroll-area", "corner")).toHaveCount(0);
        await expect(viewport(page, "Shortcuts")).not.toHaveAttribute(
            "tabindex",
        );
    });

    test("the scrollbars follow the content's and the viewport's size", async ({
        page,
    }) => {
        const root = scrollRoot(page, "Changelog");
        const view = viewport(page, "Changelog");
        await button(page, "Toggle items").click();
        await expect(scrollbar(root, "vertical")).toHaveCount(0);
        await expect(part(root, "scroll-area", "corner")).toHaveCount(0);
        await expect(scrollbar(root, "horizontal")).toHaveCount(1);
        await expect(view).toHaveAttribute("tabindex", "0");
        await button(page, "Toggle width").click();
        await expect(part(root, "scroll-area", "scrollbar")).toHaveCount(0);
        await expect(view).not.toHaveAttribute("tabindex");
        await button(page, "Toggle items").click();
        await button(page, "Toggle width").click();
        await expect(scrollbar(root, "vertical")).toHaveCount(1);
        await expect(scrollbar(root, "horizontal")).toHaveCount(1);
        await expect(part(root, "scroll-area", "corner")).toHaveCount(1);
        await expect(view).toHaveAttribute("tabindex", "0");
        await expectThumbFollows(view, scrollbar(root, "vertical"));
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test("scroll area / basic?dir=rtl: the scrollbar at the left, the thumb from the right", async ({
    page,
}) => {
    await openScenario(page, "/scroll-area/basic", { dir: "rtl" });
    const root = scrollRoot(page, "Changelog");
    const view = viewport(page, "Changelog");
    const rootBox = await root.boundingBox();
    const barBox = await scrollbar(root, "vertical").boundingBox();
    expect(rootBox).not.toBeNull();
    expect(barBox).not.toBeNull();
    expect(
        (barBox as NonNullable<typeof barBox>).x -
            (rootBox as NonNullable<typeof rootBox>).x,
    ).toBeLessThanOrEqual(2);
    const horizontal = scrollbar(root, "horizontal");
    const track = await trackGeometry(horizontal);
    expect(Math.abs(track.end - track.thumbEnd)).toBeLessThanOrEqual(1);
    const from = await thumb(horizontal).boundingBox();
    expect(from).not.toBeNull();
    const thumbBox = from as NonNullable<typeof from>;
    await dragFrom(page, thumb(horizontal), {
        x: Math.round(
            thumbBox.x +
                thumbBox.width / 2 -
                (track.room - track.thumbSize) / 2,
        ),
        y: Math.round(thumbBox.y + thumbBox.height / 2),
    });
    await page.mouse.up();
    const metrics = await scrollMetrics(view);
    expect(metrics.scrollLeft).toBeLessThan(0);
    expect(
        Math.abs(Math.abs(metrics.scrollLeft) - metrics.maxX / 2),
    ).toBeLessThan(metrics.maxX * 0.02);
    await expect(root).toHaveAttribute("data-overflow-x-start", "");
    await expectThumbFollows(view, horizontal, true);
    await expectNoAxeViolations(page);
});

test.describe("scroll area / links", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/scroll-area/links");
    });

    test("a viewport with links takes no tab stop: Tab reaches the first link", async ({
        page,
    }) => {
        const view = viewport(page, "Chapters");
        await expect(
            scrollbar(scrollRoot(page, "Chapters"), "vertical"),
        ).toHaveCount(1);
        await expect(view).not.toHaveAttribute("tabindex");
        await page.keyboard.press("Tab");
        await expect(
            page.getByRole("link", { name: "Chapter 1", exact: true }),
        ).toBeFocused();
    });

    test("tabbing to the last link scrolls to the bottom, and the thumb follows", async ({
        page,
    }) => {
        const view = viewport(page, "Chapters");
        await page
            .getByRole("link", { name: "Chapter 19", exact: true })
            .focus();
        await page.keyboard.press("Tab");
        await expect(
            page.getByRole("link", { name: "Chapter 20", exact: true }),
        ).toBeFocused();
        await expect
            .poll(async () => {
                const metrics = await scrollMetrics(view);
                return metrics.maxY - metrics.scrollTop;
            })
            .toBeLessThanOrEqual(1);
        const bar = scrollbar(scrollRoot(page, "Chapters"), "vertical");
        await expectThumbFollows(view, bar);
        const track = await trackGeometry(bar);
        expect(Math.abs(track.end - track.thumbEnd)).toBeLessThanOrEqual(1);
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});
