import { stepIndex } from "./list-navigation.ts";

export interface TabsKeyOptions {
    orientation: "horizontal" | "vertical";
    rtl: boolean;
    loop: boolean;
}

/**
 * The tab a key moves focus to (spec/tabs.md, "Keyboard"): arrows along the orientation (mirrored
 * in RTL), Home and End; `null` when the key does not move it. Disabled tabs are reachable.
 */
export function tabsKeyTarget(
    key: string,
    index: number,
    count: number,
    options: TabsKeyOptions,
): number | null {
    const next =
        options.orientation === "vertical"
            ? "ArrowDown"
            : options.rtl
              ? "ArrowLeft"
              : "ArrowRight";
    const previous =
        options.orientation === "vertical"
            ? "ArrowUp"
            : options.rtl
              ? "ArrowRight"
              : "ArrowLeft";
    if (key === next || key === previous) {
        return stepIndex(count, index, key === next ? 1 : -1, {
            loop: options.loop,
        });
    }
    if (key === "Home") {
        return count > 0 ? 0 : null;
    }
    if (key === "End") {
        return count > 0 ? count - 1 : null;
    }
    return null;
}

/**
 * The item a key moves focus to in a menu (spec/menu.md, "Keyboard"): ArrowDown and ArrowUp (wrapping
 * with `loop`), Home and End; `null` when the key does not move it. Disabled items are reachable.
 */
export function menuKeyTarget(
    key: string,
    index: number,
    count: number,
    options: { loop: boolean },
): number | null {
    if (key === "ArrowDown" || key === "ArrowUp") {
        return stepIndex(count, index, key === "ArrowDown" ? 1 : -1, {
            loop: options.loop,
        });
    }
    if (key === "Home") {
        return count > 0 ? 0 : null;
    }
    if (key === "End") {
        return count > 0 ? count - 1 : null;
    }
    return null;
}

/** The keys that open and close a submenu: the arrows toward and away from it. */
export function submenuKeys(rtl: boolean): { open: string; close: string } {
    return rtl
        ? { open: "ArrowLeft", close: "ArrowRight" }
        : { open: "ArrowRight", close: "ArrowLeft" };
}

export interface RadioKeyOptions {
    rtl: boolean;
    /** Wrap from the last radio to the first, and back (spec/radio-group.md, `loopFocus`). */
    loop: boolean;
    /** The radios the arrows pass over: the disabled ones. */
    skip?: (index: number) => boolean;
}

/**
 * The radio an arrow key moves focus (and the check) to in a radio group (spec/radio-group.md,
 * "Keyboard"): ArrowDown and ArrowRight the next, ArrowUp and ArrowLeft the previous, whatever the
 * orientation (APG); in RTL, ArrowLeft is the next and ArrowRight the previous. Skipped radios are
 * passed over. `null` when the key does not move it: another key, or an end without `loop`.
 */
export function radioKeyTarget(
    key: string,
    index: number,
    count: number,
    options: RadioKeyOptions,
): number | null {
    const forward = options.rtl
        ? key === "ArrowDown" || key === "ArrowLeft"
        : key === "ArrowDown" || key === "ArrowRight";
    const backward = options.rtl
        ? key === "ArrowUp" || key === "ArrowRight"
        : key === "ArrowUp" || key === "ArrowLeft";
    if (!forward && !backward) {
        return null;
    }
    const target = stepIndex(count, index, forward ? 1 : -1, {
        loop: options.loop,
        skip: options.skip,
    });
    return target === index || target === -1 ? null : target;
}
