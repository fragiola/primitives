import type { Page } from "@playwright/test";

/**
 * Holds a touch at a point for `ms` (moving it by `move` px along x first, if given), then
 * releases it, through Chromium's own input pipeline (CDP `Input.dispatchTouchEvent`), so the page
 * receives the pointer, touch and compatibility mouse events a real touch screen sends. Needs a
 * touch context (`test.use({ hasTouch: true })`).
 */
export async function holdTouch(
    page: Page,
    point: { x: number; y: number },
    ms: number,
    move = 0,
): Promise<void> {
    const cdp = await page.context().newCDPSession(page);
    const { x, y } = point;
    await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
    });
    if (move !== 0) {
        for (const step of [move / 3, (2 * move) / 3, move]) {
            await cdp.send("Input.dispatchTouchEvent", {
                type: "touchMove",
                touchPoints: [{ x: x + step, y }],
            });
        }
    }
    await page.waitForTimeout(ms);
    await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
    });
    await cdp.detach();
}
