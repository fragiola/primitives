import type { ChangeDetails } from "@fragiola/primitives-react/number-field";
import { useState } from "react";

/** The last `onValueChange` (spec/number-field.md, "Scenarios"): its value and its reason. */
export function useNumberOutput() {
    const [last, setLast] = useState<{ value: string; reason: string }>();
    return {
        onValueChange: (value: number | null, details: ChangeDetails) =>
            setLast({
                value: value === null ? "null" : String(value),
                reason: details.reason,
            }),
        values: { value: last?.value, reason: last?.reason },
    };
}
