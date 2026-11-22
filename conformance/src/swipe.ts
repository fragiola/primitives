import type { Locator, Page } from "@playwright/test";

// spec/drawer.md, "Swipe", the tolerances: a slow drag moves 5 px per 20 ms (well under a flick's
// 0.5 px per ms); a flick moves within three events, a few ms apart.

export interface DragOptions {
    /** `slow` (5 px per 20 ms), or `flick` (three moves at once). */
    speed?: "slow" | "flick";
    /** Keep the pointer down at the end (a test reads the state mid-swipe). */
    hold?: boolean;
}

/** The centre of a locator's box, on the page. */
export async function centreOf(
    locator: Locator,
): Promise<{ x: number; y: number }> {
    const box = await locator.boundingBox();
    if (box === null) {
        throw new Error("the element has no box");
    }
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

function steps(dx: number, dy: number, speed: "slow" | "flick"): number {
    return speed === "flick"
        ? 3
        : Math.max(1, Math.ceil(Math.hypot(dx, dy) / 5));
}

/** A mouse drag from the centre of `from` by `dx`, `dy`. Returns the release function when held. */
export async function mouseDrag(
    page: Page,
    from: Locator,
    dx: number,
    dy: number,
    options: DragOptions = {},
): Promise<() => Promise<void>> {
    const { x, y } = await centreOf(from);
    const speed = options.speed ?? "slow";
    const count = steps(dx, dy, speed);
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let step = 1; step <= count; step += 1) {
        await page.mouse.move(x + (dx * step) / count, y + (dy * step) / count);
        if (speed === "slow") {
            await page.waitForTimeout(20);
        }
    }
    const release = () => page.mouse.up();
    if (!options.hold) {
        await release();
    }
    return release;
}

/**
 * A touch drag from the centre of `from` by `dx`, `dy`, through Chromium's own input pipeline (CDP
 * `Input.dispatchTouchEvent`), so the page receives the pointer and touch events a touch screen
 * sends, and scrolls as it would. Needs a touch context (`test.use({ hasTouch: true })`).
 */
export async function touchDrag(
    page: Page,
    from: Locator,
    dx: number,
    dy: number,
    options: DragOptions = {},
): Promise<void> {
    const { x, y } = await centreOf(from);
    const speed = options.speed ?? "slow";
    const count = steps(dx, dy, speed);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
    });
    for (let step = 1; step <= count; step += 1) {
        await cdp.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [
                { x: x + (dx * step) / count, y: y + (dy * step) / count },
            ],
        });
        if (speed === "slow") {
            await page.waitForTimeout(20);
        }
    }
    await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
    });
    await cdp.detach();
}

/** A CSS variable of an element's inline style, as written (`"120px"`). */
export function cssVariable(locator: Locator, name: string): Promise<string> {
    return locator.evaluate(
        (element, variable) =>
            (element as HTMLElement).style.getPropertyValue(variable).trim(),
        name,
    );
}
