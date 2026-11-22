// The `validate` functions of /field/validation (spec/field.md).

export function validateUsername(value: unknown): string | null {
    const text = String(value ?? "");
    return text.length > 0 && text.length < 3 ? "At least 3 characters." : null;
}

export function validatePassword(value: unknown): string[] {
    const text = String(value ?? "");
    const errors: string[] = [];
    if (!/\d/.test(text)) {
        errors.push("Include a number.");
    }
    if (text.length < 8) {
        errors.push("At least 8 characters.");
    }
    return errors;
}

export function validateCode(value: unknown): string | null {
    return value === "AAA" ? "This code is taken." : null;
}

/** /field/async: `ada` is taken, and its answer is the slow one (spec/field.md). */
export function checkUsername(
    value: unknown,
    resolved: (value: string) => void,
): Promise<string | null> {
    const text = String(value ?? "");
    return new Promise((resolve) => {
        setTimeout(
            () => {
                resolved(text);
                resolve(text === "ada" ? "This username is taken." : null);
            },
            text === "ada" ? 400 : 50,
        );
    });
}

/** /field/match: the range error's `match`. */
export function outOfRange(validity: {
    rangeUnderflow: boolean;
    rangeOverflow: boolean;
}): boolean {
    return validity.rangeUnderflow || validity.rangeOverflow;
}

/** /field/more-controls: at least one topping. */
export function validateToppings(value: unknown): string | null {
    return Array.isArray(value) && value.length === 0
        ? "Choose a topping."
        : null;
}

/** /form/basic: a work address ends in `@example.com`. */
export function validateWorkEmail(value: unknown): string | null {
    const text = String(value ?? "");
    return text !== "" && !text.endsWith("@example.com")
        ? "Use your work email."
        : null;
}
