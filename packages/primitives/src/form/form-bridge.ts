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
 * invisible element). Returns the cleanup.
 */
export function bridgeForm(
    input: HTMLInputElement,
    options: FormBridgeOptions,
): () => void {
    const form = input.form;
    let timer: ReturnType<typeof setTimeout> | undefined;
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
            }
        }
    };
    form?.addEventListener("reset", onReset);
    input.addEventListener("invalid", onInvalid);
    return () => {
        if (timer !== undefined) {
            clearTimeout(timer);
        }
        form?.removeEventListener("reset", onReset);
        input.removeEventListener("invalid", onInvalid);
    };
}
