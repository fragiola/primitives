export interface AutoRepeatOptions {
    /**
     * One step: at the press, then again every `interval` once the press lasted `delay`; a click
     * that no pointer press started (the keyboard, assistive technology) steps once. Return
     * `false` to stop the repeat (a bound reached).
     */
    onStep: (event: Event) => boolean | undefined;
    /** How long a press lasts before the repeat starts, in ms (default 400, Base UI). */
    delay?: number;
    /** The time between two repeated steps, in ms (default 60, Base UI). */
    interval?: number;
}

/**
 * Press and hold on `element` (spec/number-field.md, "Pointer": an Increment or Decrement button):
 * a primary pointer's press steps at once, and keeps stepping while it is held, until it is
 * released, canceled or leaves the element, or the window loses focus. A mouse press keeps the
 * focus where it is (its `mousedown` default is prevented), so the field's input stays focused. The `click`
 * that ends a pointer press steps no more; any other click steps once. Returns the cleanup.
 */
export function watchAutoRepeat(
    element: Element,
    options: AutoRepeatOptions,
): () => void {
    const { delay = 400, interval = 60 } = options;
    const doc = element.ownerDocument;
    const view = doc.defaultView;
    let timer: number | undefined;
    let pressed = false;
    // the click that follows a pointer press, already stepped at its pointerdown
    let swallowClick = false;

    const stop = () => {
        if (timer !== undefined) {
            view?.clearTimeout(timer);
            view?.clearInterval(timer);
            timer = undefined;
        }
        if (!pressed) {
            return;
        }
        pressed = false;
        // the click a release sends comes before this task ends; a press that sends none
        // (released outside, a long touch, a button disabled at its bound) swallows no later
        // click
        view?.setTimeout(() => {
            swallowClick = false;
        });
        doc.removeEventListener("pointerup", stop, true);
        doc.removeEventListener("pointercancel", stop, true);
        element.removeEventListener("pointerleave", stop);
        view?.removeEventListener("blur", stop);
    };
    const onDown = (event: PointerEvent) => {
        if (event.button !== 0 || !event.isPrimary) {
            return;
        }
        stop();
        swallowClick = true;
        if (options.onStep(event) === false) {
            view?.setTimeout(() => {
                swallowClick = false;
            }, 1000);
            return;
        }
        pressed = true;
        doc.addEventListener("pointerup", stop, true);
        doc.addEventListener("pointercancel", stop, true);
        element.addEventListener("pointerleave", stop);
        view?.addEventListener("blur", stop);
        timer = view?.setTimeout(() => {
            timer = view?.setInterval(() => {
                if (options.onStep(event) === false) {
                    stop();
                }
            }, interval);
        }, delay);
    };
    const onClick = (event: Event) => {
        if (swallowClick) {
            swallowClick = false;
            return;
        }
        options.onStep(event);
    };
    // a mouse press moves no focus: the field's input keeps it (APG: focus stays on the text
    // field)
    const onMouseDown = (event: MouseEvent) => {
        if (event.button === 0) {
            event.preventDefault();
        }
    };
    // a held touch opens no context menu
    const onContextMenu = (event: Event) => {
        if (pressed) {
            event.preventDefault();
        }
    };
    element.addEventListener("pointerdown", onDown as EventListener);
    element.addEventListener("mousedown", onMouseDown as EventListener);
    element.addEventListener("click", onClick);
    element.addEventListener("contextmenu", onContextMenu);
    return () => {
        stop();
        element.removeEventListener("pointerdown", onDown as EventListener);
        element.removeEventListener("mousedown", onMouseDown as EventListener);
        element.removeEventListener("click", onClick);
        element.removeEventListener("contextmenu", onContextMenu);
    };
}
