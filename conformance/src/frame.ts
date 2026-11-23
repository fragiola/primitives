import type { Frame, Page } from "@playwright/test";

/** Where the iframe of {@link openInFrame} sits in the host page, in CSS pixels. */
export const FRAME_BOX = { x: 120, y: 120, width: 900, height: 600 };

/**
 * Opens `/<component>/<scenario>` inside an iframe of a host page on the same origin (served by
 * the test itself, `/__frame-host`), and returns the scenario's frame once rendered. The host's
 * top-left corner, outside the iframe, is where a pointer that leaves the iframe goes.
 */
export async function openInFrame(page: Page, path: string): Promise<Frame> {
    const { x, y, width, height } = FRAME_BOX;
    await page.route("**/__frame-host", (route) =>
        route.fulfill({
            contentType: "text/html",
            body: `<!doctype html><html><body style="margin:0"><iframe title="scenario" src="${path}" style="position:absolute;left:${x}px;top:${y}px;width:${width}px;height:${height}px;border:0"></iframe></body></html>`,
        }),
    );
    await page.goto("/__frame-host");
    const element = await page.locator("iframe").elementHandle();
    const frame = await element?.contentFrame();
    if (frame === null || frame === undefined) {
        throw new Error("no scenario frame");
    }
    await frame
        .locator("html[data-fixture-ready]")
        .waitFor({ state: "attached" });
    return frame;
}
