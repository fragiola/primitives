import type { Page } from "@playwright/test";

/**
 * Replaces the browser's EyeDropper before the page loads (spec/color-picker.md,
 * "EyeDropperTrigger"): `null` removes it, a hex is what its `open()` resolves with, `"cancel"`
 * rejects as an Escape does.
 */
export async function stubEyeDropper(
    page: Page,
    pick: string | null,
): Promise<void> {
    await page.addInitScript((picked) => {
        const view = window as Window & { EyeDropper?: unknown };
        if (picked === null) {
            delete view.EyeDropper;
            return;
        }
        view.EyeDropper = class {
            open(): Promise<{ sRGBHex: string }> {
                (
                    window as Window & { eyeDropperOpened?: boolean }
                ).eyeDropperOpened = true;
                return picked === "cancel"
                    ? Promise.reject(new DOMException("aborted", "AbortError"))
                    : Promise.resolve({ sRGBHex: picked });
            }
        };
    }, pick);
}
