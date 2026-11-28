import type { Page } from "@playwright/test";

/** The exit seen by {@link recordExit}: what the part did between `data-ending-style` and unmount. */
export interface ExitRecord {
    /** The part carried `data-ending-style` while it was still in the document. */
    ending: boolean;
    /** Animations or transitions running on it once it carried `data-ending-style`. */
    running: number;
    /** Milliseconds from `data-ending-style` to its removal, `null` while it is still mounted. */
    unmountedAfter: number | null;
    /**
     * The opacity of each frame painted while the part was still in the document, with
     * `data-ending-style`, after its exit animations had finished (spec/README.md, "Lifecycle": the
     * unmount is never a frame late). Empty when it unmounted before the next paint.
     */
    paintedAfterEnd: number[];
}

/**
 * Makes the part's exit a keyframe animation with `animation-fill-mode: none` (tw-animate-css's
 * `animate-out`), over `--pr-motion`: its resting style while ending stays visible (opacity 1),
 * which it is back at once the animation ends, so a frame painted before the unmount shows it.
 */
export async function keyframeExit(page: Page, part: string): Promise<void> {
    await page.addStyleTag({
        content: `@keyframes pr-conformance-exit { from { opacity: 1; } to { opacity: 0; } }
[data-primitives-part="${part}"][data-ending-style] {
    opacity: 1;
    transition: none;
    animation: pr-conformance-exit var(--pr-motion) linear;
}`,
    });
}

/**
 * Waits until no animation runs in the page. An enter transition starts once the popup drops
 * `data-starting-style`, which a framework that renders in a later task (zoneless Angular) does a
 * frame or two after the popup is visible: wait for the frames, then for every running animation,
 * until none is left.
 */
export async function settleAnimations(page: Page): Promise<void> {
    await page.evaluate(async () => {
        const frame = () =>
            new Promise((resolve) =>
                requestAnimationFrame(() => resolve(null)),
            );
        for (let round = 0; round < 10; round += 1) {
            await frame();
            await frame();
            const running = document.getAnimations();
            if (running.length === 0) {
                return;
            }
            await Promise.all(running.map((animation) => animation.finished));
        }
    });
}

/**
 * Makes every overlay's enter and exit transition last `ms` (the recipes read `--pr-motion`), so a
 * test can see the exit before the unmount and act during it.
 */
export async function slowMotion(page: Page, ms = 600): Promise<void> {
    await page.addStyleTag({
        content: `:root, [data-example-theme] { --pr-motion: ${ms}ms !important; }`,
    });
}

/**
 * Starts watching the mounted `data-primitives-part="<part>"` element (spec/dialog.md,
 * "Animation": the element stays mounted with `data-ending-style` until its exit animation ends).
 * Returns a reader of what it did since.
 *
 * Each frame is checked right before its paint: a probe element resized on every animation frame
 * makes a `ResizeObserver` report after the frame's layout, the last script before the paint,
 * once the animation frame callbacks and their microtasks (an animation's `finished`) have run.
 */
export async function recordExit(
    page: Page,
    part: string,
): Promise<() => Promise<ExitRecord>> {
    const key = `__exit_${part.replaceAll("-", "_")}`;
    await page.evaluate(
        ({ part, key }) => {
            const element = document.querySelector(
                `[data-primitives-part="${part}"]`,
            );
            if (element === null) {
                throw new Error(`no ${part} is mounted`);
            }
            const record = {
                ending: false,
                running: 0,
                unmountedAfter: null as number | null,
                paintedAfterEnd: [] as number[],
            };
            let endingAt = 0;
            // an animation of the exit ran: once none runs, the exit has finished
            let animated = false;
            const running = () =>
                element
                    .getAnimations()
                    .some(
                        (animation) =>
                            animation.pending ||
                            animation.playState === "running",
                    );
            const probe = document.createElement("div");
            probe.style.cssText =
                "position: fixed; inset-block-start: -10px; inset-inline-start: 0; block-size: 1px; inline-size: 1px; pointer-events: none;";
            document.body.append(probe);
            let frame = 0;
            let stopped = false;
            const resize = () => {
                if (stopped) {
                    return;
                }
                frame += 1;
                probe.style.inlineSize = `${1 + (frame % 2)}px`;
                requestAnimationFrame(resize);
            };
            requestAnimationFrame(resize);
            const beforePaint = new ResizeObserver(() => {
                if (
                    stopped ||
                    !element.isConnected ||
                    !element.hasAttribute("data-ending-style")
                ) {
                    return;
                }
                if (running()) {
                    animated = true;
                } else if (animated) {
                    record.paintedAfterEnd.push(
                        Number(getComputedStyle(element).opacity),
                    );
                }
            });
            beforePaint.observe(probe);
            const stop = () => {
                stopped = true;
                beforePaint.disconnect();
                probe.remove();
            };
            const check = () => {
                if (
                    !record.ending &&
                    element.isConnected &&
                    element.hasAttribute("data-ending-style")
                ) {
                    record.ending = true;
                    endingAt = performance.now();
                    record.running = element.getAnimations().length;
                }
                if (!element.isConnected && record.unmountedAfter === null) {
                    record.unmountedAfter = record.ending
                        ? performance.now() - endingAt
                        : 0;
                    observer.disconnect();
                    stop();
                }
            };
            const observer = new MutationObserver(check);
            observer.observe(document, {
                subtree: true,
                childList: true,
                attributes: true,
                attributeFilter: ["data-ending-style"],
            });
            (window as unknown as Record<string, unknown>)[key] = record;
        },
        { part, key },
    );
    return () =>
        page.evaluate(
            (key) =>
                (window as unknown as Record<string, ExitRecord>)[
                    key
                ] as ExitRecord,
            key,
        );
}

/** Marks the mounted part, so a later {@link isSameElement} tells whether it was kept or remade. */
export async function markElement(page: Page, part: string): Promise<void> {
    await page.evaluate((part) => {
        const element = document.querySelector(
            `[data-primitives-part="${part}"]`,
        );
        (window as unknown as { __marked?: Element | null }).__marked = element;
    }, part);
}

/** Whether the mounted part is the element {@link markElement} marked. */
export async function isSameElement(
    page: Page,
    part: string,
): Promise<boolean> {
    return page.evaluate((part) => {
        const marked = (window as unknown as { __marked?: Element | null })
            .__marked;
        return (
            marked != null &&
            document.querySelector(`[data-primitives-part="${part}"]`) ===
                marked
        );
    }, part);
}
