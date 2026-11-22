/**
 * Runs a Form's validation on each submission of `form` (spec/form.md, "A submission"): a capture
 * listener on the form, so it runs before any listener of the consumer's on the form or above it.
 * When `attempt` returns `false`, the submission is blocked: `preventDefault`, and
 * `stopImmediatePropagation`, so no other listener sees it. Returns the cleanup.
 */
export function guardFormSubmit(
    form: HTMLFormElement,
    attempt: (event: SubmitEvent) => boolean,
): () => void {
    const onSubmit = (event: Event) => {
        if (!attempt(event as SubmitEvent)) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    };
    form.addEventListener("submit", onSubmit, true);
    return () => form.removeEventListener("submit", onSubmit, true);
}

/** The first of these elements in document order (`null` for none). */
export function firstInDocumentOrder(
    elements: Iterable<HTMLElement | null | undefined>,
): HTMLElement | null {
    let first: HTMLElement | null = null;
    for (const element of elements) {
        if (
            element != null &&
            (first === null ||
                first.compareDocumentPosition(element) &
                    Node.DOCUMENT_POSITION_PRECEDING)
        ) {
            first = element;
        }
    }
    return first;
}

/** Focuses a field's control for the Form: a text input's text is selected, as Base UI does. */
export function focusFieldControl(element: HTMLElement): void {
    element.focus();
    if (element.tagName === "INPUT") {
        try {
            (element as HTMLInputElement).select();
        } catch {
            // an input type with no selection (a checkbox, a range)
        }
    }
}
