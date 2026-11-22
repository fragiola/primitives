import type { Page } from "@playwright/test";

/** The exit seen by {@link recordExit}: what the part did between `data-ending-style` and unmount. */
export interface ExitRecord {
    /** The part carried `data-ending-style` while it was still in the document. */
    ending: boolean;
    /** Animations or transitions running on it once it carried `data-ending-style`. */
    running: number;
    /** Milliseconds from `data-ending-style` to its removal, `null` while it is still mounted. */
    unmountedAfter: number | null;
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
            };
            let endingAt = 0;
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
