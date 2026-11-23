const CONTROLS = "button, input, select, textarea";
const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A press on a Label (spec/label.md, "Pointer"): a double press selects none of its text (its
 * `mousedown` default is prevented, Radix and Base UI), unless it lands on a control inside the
 * label, whose own text editing stays.
 */
export function preventLabelSelection(event: MouseEvent): void {
    const target = event.target as Element | null;
    if (target?.closest?.(CONTROLS)) {
        return;
    }
    if (!event.defaultPrevented && event.detail > 1) {
        event.preventDefault();
    }
}

/**
 * The element a Label's press focuses when `for` names no labelable element (spec/label.md,
 * "Pointer"): a Slider's thumb, a group. The named element itself when it can take the focus,
 * else its first focusable descendant; `null` when `for` names a labelable element (the browser
 * activates it) or nothing.
 */
export function labelFocusTarget(label: HTMLLabelElement): HTMLElement | null {
    if (label.control !== null || label.htmlFor === "") {
        return null;
    }
    const named = label.ownerDocument.getElementById(label.htmlFor);
    if (named === null) {
        return null;
    }
    if (named.matches(FOCUSABLE)) {
        return named as HTMLElement;
    }
    return named.querySelector<HTMLElement>(FOCUSABLE);
}
