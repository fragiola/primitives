import { useCallback, useRef, useState } from "react";

/**
 * Controlled when `value` is given (it only reports changes), uncontrolled otherwise, seeded by
 * `defaultValue` (spec/README.md, "Normalized API names").
 */
export function useControllableState<T, Details>(
    value: T | undefined,
    defaultValue: T,
    onChange: ((value: T, details: Details) => void) | undefined,
): [T, (next: T, details: Details) => void] {
    const [own, setOwn] = useState(defaultValue);
    const controlled = value !== undefined;
    const current = controlled ? value : own;
    const latest = useRef({ current, onChange, controlled });
    latest.current = { current, onChange, controlled };
    // the value just reported, until the render it causes: a second report of the same change in
    // the same task (a popover's Tab-out, then its focus watch) is not repeated
    const pending = useRef<{ value: T } | null>(null);
    const set = useCallback((next: T, details: Details) => {
        const {
            current: rendered,
            onChange: callback,
            controlled: isControlled,
        } = latest.current;
        const before = pending.current ? pending.current.value : rendered;
        if (Object.is(before, next)) {
            return;
        }
        pending.current = { value: next };
        queueMicrotask(() => {
            pending.current = null;
        });
        if (!isControlled) {
            setOwn(next);
        }
        callback?.(next, details);
    }, []);
    return [current, set];
}
