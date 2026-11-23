export interface FormBridgeOptions {
    /**
     * The input's form was reset. Called once the browser has reset its controls, so the
     * framework can return the component to its default and write it back onto the input.
     */
    reset?: () => void;
    /** The browser's validation found the input invalid: where focus goes instead (the primitive). */
    invalid?: () => HTMLElement | null;
}

/** The first control of `form`, in its order, that would block a submission. */
function firstInvalidControl(form: HTMLFormElement): Element | null {
    for (const element of form.elements) {
        const control = element as HTMLInputElement;
        if (control.willValidate && !control.validity.valid) {
            return element;
        }
    }
    return null;
}

/**
 * Bridges a primitive's hidden input and its form (spec/README.md, "Forms"): a form reset, and a
 * failed validation (the browser would focus the hidden input; focus goes to the primitive, when
 * its input is the form's first invalid control, and the browser's bubble is not shown on an
 * invisible element, nor does the browser then move the focus on to a later invalid control).
 * Returns the cleanup.
 */
export function bridgeForm(
    input: HTMLInputElement,
    options: FormBridgeOptions,
): () => void {
    const form = input.form;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // the validation this bridge took the focus in: the later controls' `invalid` events
    let holding: ReturnType<typeof setTimeout> | undefined;
    const cancelLater = (event: Event) => {
        if (event.target !== input) {
            event.preventDefault();
        }
    };
    const release = () => {
        if (holding !== undefined) {
            clearTimeout(holding);
            holding = undefined;
            form?.removeEventListener("invalid", cancelLater, true);
        }
    };
    const onReset = () => {
        // the reset event fires before the browser resets the controls
        timer = setTimeout(() => {
            timer = undefined;
            options.reset?.();
        });
    };
    const onInvalid = (event: Event) => {
        const target = options.invalid?.();
        if (target) {
            event.preventDefault();
            // the browser fires `invalid` on every invalid control, then focuses the first: only
            // the first one's primitive takes focus (Epic #26, several required pickers)
            if (form === null || firstInvalidControl(form) === input) {
                target.focus();
                // then the browser would focus the first control whose `invalid` was not
                // canceled, a later native one, and show its bubble: the rest of this validation's
                // events are canceled (Epic #49). They come in the same task, one per control,
                // with microtasks between them, so the hold ends with the task
                if (form !== null && holding === undefined) {
                    form.addEventListener("invalid", cancelLater, true);
                    holding = setTimeout(release);
                }
            }
        }
    };
    form?.addEventListener("reset", onReset);
    input.addEventListener("invalid", onInvalid);
    return () => {
        if (timer !== undefined) {
            clearTimeout(timer);
        }
        release();
        form?.removeEventListener("reset", onReset);
        input.removeEventListener("invalid", onInvalid);
    };
}
