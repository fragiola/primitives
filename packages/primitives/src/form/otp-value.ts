/**
 * The characters an OTP field accepts (spec/otp-field.md, "API"): digits, letters, both, any
 * character but whitespace, or a pattern each character must match.
 */
export type OtpValidationType =
    | "numeric"
    | "alpha"
    | "alphanumeric"
    | "none"
    | RegExp;

const CLASSES = {
    numeric: "\\d",
    alpha: "[a-zA-Z]",
    alphanumeric: "[a-zA-Z0-9]",
    none: "\\S",
} as const;

/** Whether one character is accepted by `type` (a pattern is tested on the character alone). */
export function otpAccepts(
    character: string,
    type: OtpValidationType,
): boolean {
    if (/\s/.test(character)) {
        return false;
    }
    if (type instanceof RegExp) {
        // a fresh, anchored copy: a global pattern's `lastIndex` never carries over
        return new RegExp(
            `^(?:${type.source})$`,
            type.flags.replace(/[gy]/g, ""),
        ).test(character);
    }
    return new RegExp(`^${CLASSES[type]}$`).test(character);
}

/**
 * `text` as an OTP value (spec/otp-field.md, "Typing"): whitespace dropped, every character
 * `type` refuses dropped, at most `length` characters (by code point). `rejected` says whether a
 * character other than whitespace was dropped (the field's `onValueInvalid`).
 */
export function normalizeOtp(
    text: string,
    length: number,
    type: OtpValidationType,
): { value: string; rejected: boolean } {
    const characters = Array.from(text.replace(/\s/g, ""));
    const accepted = characters.filter((character) =>
        otpAccepts(character, type),
    );
    return {
        value: accepted.slice(0, Math.max(length, 0)).join(""),
        rejected:
            accepted.length < characters.length ||
            accepted.length > Math.max(length, 0),
    };
}

/**
 * The value once `text` was typed or pasted into slot `index`: its characters replace the slot's
 * and the next ones, the value stays contiguous and at most `length` long (Base UI).
 */
export function replaceOtp(
    value: string,
    index: number,
    text: string,
    length: number,
    type: OtpValidationType,
): string {
    const current = Array.from(value);
    const typed = Array.from(normalizeOtp(text, length, type).value);
    const next = [
        ...current.slice(0, index),
        ...typed,
        ...current.slice(index + typed.length),
    ];
    return normalizeOtp(next.join(""), length, type).value;
}

/** The value without the character of slot `index`; the later ones move back (Base UI). */
export function removeOtpCharacter(value: string, index: number): string {
    const current = Array.from(value);
    if (index < 0 || index >= current.length) {
        return value;
    }
    current.splice(index, 1);
    return current.join("");
}

/** The virtual keyboard a slot asks for: `numeric` for digits, else `text`. */
export function otpInputMode(type: OtpValidationType): "numeric" | "text" {
    return type === "numeric" ? "numeric" : "text";
}

/**
 * The hidden input's `pattern`: a complete value, `length` accepted characters, so a native form
 * refuses an incomplete code (spec/otp-field.md, "Forms").
 */
export function otpPattern(type: OtpValidationType, length: number): string {
    const one = type instanceof RegExp ? `(?:${type.source})` : CLASSES[type];
    return `${one}{${Math.max(length, 0)}}`;
}
