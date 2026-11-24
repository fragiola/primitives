import type { Color } from "./color-value.ts";
import { parseColor } from "./parse-color.ts";

/** The EyeDropper API of a window (Chromium's; not in every browser, spec/color-picker.md). */
interface EyeDropperConstructor {
    new (): {
        open(options?: { signal?: AbortSignal }): Promise<{ sRGBHex: string }>;
    };
}

function eyeDropperOf(element: Element): EyeDropperConstructor | undefined {
    const view = element.ownerDocument.defaultView as
        | (Window & { EyeDropper?: unknown })
        | null;
    const api = view?.EyeDropper;
    return typeof api === "function"
        ? (api as EyeDropperConstructor)
        : undefined;
}

/** Whether `element`'s window has the EyeDropper API (spec/color-picker.md, "EyeDropperTrigger"). */
export function supportsEyeDropper(element: Element): boolean {
    return eyeDropperOf(element) !== undefined;
}

/**
 * Opens the browser's eyedropper from `element`'s window and resolves with the color the user
 * picked (an opaque rgb color), or `null` when the user cancelled it (Escape), the browser refused
 * it or has no EyeDropper API. It never rejects: a cancelled pick is no error for a picker.
 */
export async function openEyeDropper(
    element: Element,
    signal?: AbortSignal,
): Promise<Color | null> {
    const EyeDropper = eyeDropperOf(element);
    if (EyeDropper === undefined) {
        return null;
    }
    try {
        const result = await new EyeDropper().open(
            signal === undefined ? undefined : { signal },
        );
        return parseColor(result.sRGBHex);
    } catch {
        return null;
    }
}
