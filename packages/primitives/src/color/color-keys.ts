import type { ColorChannelRange } from "./color-value.ts";

export interface ColorAreaKeyOptions {
    x: number;
    y: number;
    xRange: ColorChannelRange;
    yRange: ColorChannelRange;
    rtl: boolean;
}

/**
 * The axis and value a key moves a ColorArea's thumb to (spec/color-area.md, "Keyboard"), before
 * snapping and clamping; `null` when the key does not move it. ArrowLeft and ArrowRight move `x`
 * (swapped in RTL), ArrowUp and ArrowDown `y`, with Shift by the large step; Page Up and Page
 * Down move `y` by its large step; Home and End set `x` to its `min` and `max`.
 */
export function colorAreaKeyTarget(
    key: string,
    shiftKey: boolean,
    options: ColorAreaKeyOptions,
): { axis: "x" | "y"; value: number } | null {
    const { x, y, xRange, yRange } = options;
    const xAmount = shiftKey ? xRange.largeStep : xRange.step;
    const yAmount = shiftKey ? yRange.largeStep : yRange.step;
    const right = options.rtl ? -1 : 1;
    switch (key) {
        case "ArrowRight":
            return { axis: "x", value: x + right * xAmount };
        case "ArrowLeft":
            return { axis: "x", value: x - right * xAmount };
        case "ArrowUp":
            return { axis: "y", value: y + yAmount };
        case "ArrowDown":
            return { axis: "y", value: y - yAmount };
        case "PageUp":
            return { axis: "y", value: y + yRange.largeStep };
        case "PageDown":
            return { axis: "y", value: y - yRange.largeStep };
        case "Home":
            return { axis: "x", value: xRange.min };
        case "End":
            return { axis: "x", value: xRange.max };
        default:
            return null;
    }
}

/** `hue` turned into `[0, 360)`, with the hue's step precision (whole degrees by default). */
export function wrapHue(hue: number, step = 1): number {
    const decimals = (String(step).split(".")[1] ?? "").length;
    const snapped = Math.round(hue / step) * step;
    return Number((((snapped % 360) + 360) % 360).toFixed(decimals));
}

/**
 * The hue a key moves a ColorWheel to (spec/color-wheel.md, "Keyboard"), wrapped into `[0, 360)`;
 * `null` when the key does not move it. ArrowRight and ArrowUp increase it by `step` (Shift: by
 * `largeStep`), ArrowLeft and ArrowDown decrease it; Page Up and Page Down by `largeStep`; Home
 * sets 0 and End the last step before 360.
 */
export function colorWheelKeyTarget(
    key: string,
    shiftKey: boolean,
    hue: number,
    step = 1,
    largeStep = 15,
): number | null {
    const amount = shiftKey ? largeStep : step;
    switch (key) {
        case "ArrowRight":
        case "ArrowUp":
            return wrapHue(hue + amount, step);
        case "ArrowLeft":
        case "ArrowDown":
            return wrapHue(hue - amount, step);
        case "PageUp":
            return wrapHue(hue + largeStep, step);
        case "PageDown":
            return wrapHue(hue - largeStep, step);
        case "Home":
            return 0;
        case "End":
            return wrapHue(360 - step, step);
        default:
            return null;
    }
}
