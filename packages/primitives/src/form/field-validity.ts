/** The `ValidityState` keys a field reads (spec/field.md, "Validation"), `valid` aside. */
export const VALIDITY_KEYS = [
    "badInput",
    "customError",
    "patternMismatch",
    "rangeOverflow",
    "rangeUnderflow",
    "stepMismatch",
    "tooLong",
    "tooShort",
    "typeMismatch",
    "valueMissing",
] as const;

export type ValidityKey = (typeof VALIDITY_KEYS)[number];

/** A field's validity: the native flags, plus `valid` (`null` before the first validation). */
export type FieldValidity = Readonly<Record<ValidityKey, boolean>> & {
    readonly valid: boolean | null;
};

/** What a field shows: its validity and its messages (empty while valid). */
export interface FieldValidation {
    readonly validity: FieldValidity;
    readonly errors: readonly string[];
}

/** What a field's `validate` answers: a message, a list of messages, or none. */
export type FieldValidateResult = string | readonly string[] | null | undefined;

/**
 * A field's `validate`: a message, a list of messages, or none; or a promise of one of these
 * (spec/field.md, "Async validation").
 */
export type FieldValidate = (
    value: unknown,
) => FieldValidateResult | PromiseLike<FieldValidateResult>;

const NO_FLAGS = /* @__PURE__ */ Object.fromEntries(
    VALIDITY_KEYS.map((key) => [key, false]),
) as Record<ValidityKey, boolean>;

/** Before the first validation: neither valid nor invalid. */
export const UNVALIDATED: FieldValidation = {
    validity: { ...NO_FLAGS, valid: null },
    errors: [],
};

/** Valid, with no message: what a change that clears a shown error leaves. */
export const CLEARED: FieldValidation = {
    validity: { ...NO_FLAGS, valid: true },
    errors: [],
};

export interface ValidateFieldOptions {
    /** The control's value, given to `validate`. */
    value: unknown;
    validate?: FieldValidate | undefined;
    /**
     * Whether the value has changed once or a submission was attempted. Until then, a
     * `valueMissing` alone counts as valid (the required rule).
     */
    valueChanged: boolean;
    /** Runs `validate` even when the native validity has an error (the field validates on change). */
    always: boolean;
}

function isThenable(value: unknown): value is PromiseLike<FieldValidateResult> {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as { then?: unknown }).then === "function"
    );
}

function messagesOf(result: FieldValidateResult): string[] {
    if (result === null || result === undefined) {
        return [];
    }
    // a message appears once, however often `validate` returns it
    return [...new Set(typeof result === "string" ? [result] : result)].filter(
        (message) => message !== "",
    );
}

interface NativeStep {
    flags: Record<ValidityKey, boolean>;
    /** The native validity has an error (after the required rule). */
    invalid: boolean;
    errors: string[];
}

/** The native step: the element's validity, with the required rule applied. */
function nativeStep(
    element: HTMLInputElement | null,
    valueChanged: boolean,
): NativeStep {
    element?.setCustomValidity("");
    const native = element?.willValidate ? element.validity : null;
    const flags = { ...NO_FLAGS };
    for (const key of VALIDITY_KEYS) {
        flags[key] = native?.[key] ?? false;
    }
    const onlyMissing =
        flags.valueMissing &&
        VALIDITY_KEYS.every((key) => key === "valueMissing" || !flags[key]);
    if (onlyMissing && !valueChanged) {
        flags.valueMissing = false;
    }
    const invalid = VALIDITY_KEYS.some((key) => flags[key]);
    const errors =
        invalid && element !== null && element.validationMessage !== ""
            ? [element.validationMessage]
            : [];
    return { flags, invalid, errors };
}

/** The result of the native step and `validate`'s messages, setting them as the custom validity. */
function combine(
    element: HTMLInputElement | null,
    step: NativeStep,
    messages: readonly string[],
): FieldValidation {
    const flags = { ...step.flags };
    let errors = step.errors;
    if (messages.length > 0) {
        flags.customError = true;
        element?.setCustomValidity(messages.join("\n"));
        errors = [...messages];
    }
    const valid = !VALIDITY_KEYS.some((key) => flags[key]);
    return { validity: { ...flags, valid }, errors: valid ? [] : errors };
}

/**
 * Validates a field (spec/field.md, "Validation"): reads the native validity of the element the
 * form validates, applies the required rule, runs `validate`, and sets its messages as the
 * element's custom validity, so a native submission is blocked by them. `element` is `null` (or
 * barred from validation, as a `type="hidden"` input) for a control the browser cannot validate:
 * `validate` alone decides. Returns what the field would show. A `validate` that returns a promise
 * is not awaited here (its messages count as none): a field with an async `validate` uses
 * {@link createFieldValidator}.
 */
export function validateField(
    element: HTMLInputElement | null,
    options: ValidateFieldOptions,
): FieldValidation {
    const step = nativeStep(element, options.valueChanged);
    if (step.invalid && !options.always) {
        return combine(element, step, []);
    }
    const result = options.validate?.(options.value);
    return combine(element, step, isThenable(result) ? [] : messagesOf(result));
}

/** A field's validation runs, with the async rules (spec/field.md, "Async validation"). */
export interface FieldValidator {
    /**
     * Validates the field. Returns the result at once, or `null` while an async `validate` is
     * pending: `settle` then receives the result when it resolves, unless a newer run started
     * first (latest wins). A value the last resolved run validated is not validated again: its
     * messages are reused at once.
     */
    run(
        element: HTMLInputElement | null,
        options: ValidateFieldOptions,
        settle: (validation: FieldValidation) => void,
    ): FieldValidation | null;
    /** Drops the pending run, if any (the field unmounted). */
    cancel(): void;
}

function sameValue(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) {
        return true;
    }
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return false;
    }
}

/** A field's validator: one per field, for as long as it lives. */
export function createFieldValidator(): FieldValidator {
    let current = 0;
    let resolved: { value: unknown; messages: string[] } | null = null;
    return {
        run(element, options, settle) {
            current += 1;
            const run = current;
            const step = nativeStep(element, options.valueChanged);
            if (step.invalid && !options.always) {
                return combine(element, step, []);
            }
            if (
                !step.invalid &&
                resolved !== null &&
                sameValue(resolved.value, options.value)
            ) {
                return combine(element, step, resolved.messages);
            }
            const result = options.validate?.(options.value);
            if (!isThenable(result)) {
                resolved = null;
                return combine(element, step, messagesOf(result));
            }
            if (step.invalid) {
                // a native error is the result at once; the promise is not awaited
                return combine(element, step, []);
            }
            const finish = (messages: string[]) => {
                if (run !== current) {
                    return;
                }
                resolved = { value: options.value, messages };
                // the native step again: the element may have changed while the promise ran
                settle(
                    combine(
                        element,
                        nativeStep(element, options.valueChanged),
                        messages,
                    ),
                );
            };
            result.then(
                (answer) => finish(messagesOf(answer)),
                () => finish([]),
            );
            return null;
        },
        cancel() {
            current += 1;
        },
    };
}
