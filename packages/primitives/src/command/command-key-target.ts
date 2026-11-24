// A command palette's keys over its shown items (spec/command.md, "Keyboard"). Pure.

import { stepIndex } from "../collection/list-navigation.ts";

/**
 * The index of the item a key highlights among `count` shown items, from `current` (-1: none):
 * ArrowDown / ArrowUp the next / previous (wrapping with `loop`), Home / End the first / last;
 * `null` for any other key (and Home / End with Shift, which stay native).
 */
export function commandKeyTarget(
    event: Pick<
        KeyboardEvent,
        "key" | "shiftKey" | "altKey" | "ctrlKey" | "metaKey"
    >,
    current: number,
    count: number,
    loop = true,
): number | null {
    if (event.altKey || event.ctrlKey || event.metaKey) {
        return null;
    }
    switch (event.key) {
        case "ArrowDown":
            return stepIndex(count, current, 1, { loop });
        case "ArrowUp":
            return stepIndex(count, current, -1, { loop });
        case "Home":
            return event.shiftKey ? null : count > 0 ? 0 : -1;
        case "End":
            return event.shiftKey ? null : count - 1;
        default:
            return null;
    }
}
