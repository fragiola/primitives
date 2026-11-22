/** A Form's server errors, keyed by the fields' `name` (spec/form.md). */
export type FormErrors = Readonly<Record<string, string | readonly string[]>>;

/** The Form's errors for one field, as a list of messages (empty for none). */
export function formErrorsFor(
    errors: FormErrors | null | undefined,
    name: string | undefined,
): readonly string[] {
    if (errors == null || name === undefined || !Object.hasOwn(errors, name)) {
        return [];
    }
    const value = errors[name];
    const list = typeof value === "string" ? [value] : (value ?? []);
    return list.filter((message) => message !== "");
}

/** The errors without one field's key, or the same object when it has none. */
export function withoutFormErrors(
    errors: FormErrors,
    name: string,
): FormErrors {
    if (!Object.hasOwn(errors, name)) {
        return errors;
    }
    const next: Record<string, string | readonly string[]> = { ...errors };
    delete next[name];
    return next;
}
