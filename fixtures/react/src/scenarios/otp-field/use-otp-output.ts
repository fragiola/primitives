import type { ChangeDetails } from "@fragiola/primitives-react/otp-field";
import { useState } from "react";

/**
 * The last `onValueChange`, `onValueComplete` and `onValueInvalid` (spec/otp-field.md,
 * "Scenarios").
 */
export function useOtpOutput() {
    const [last, setLast] = useState<{ value: string; reason: string }>();
    const [complete, setComplete] = useState<string>();
    const [invalid, setInvalid] = useState<string>();
    return {
        handlers: {
            onValueChange: (value: string, details: ChangeDetails) =>
                setLast({
                    value: value === "" ? "empty" : value,
                    reason: details.reason,
                }),
            onValueComplete: (value: string) => setComplete(value),
            onValueInvalid: (text: string) => setInvalid(text),
        },
        values: {
            value: last?.value,
            reason: last?.reason,
            complete,
            invalid,
        },
    };
}
