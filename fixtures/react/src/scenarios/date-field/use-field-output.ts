import type { ChangeDetails } from "@fragiola/primitives-react/date-field";
import { useState } from "react";

/** The last `onValueChange` of a date or time field (spec/date-field.md, "Scenarios"). */
export function useFieldOutput<Value>(
    print: (value: Value) => string | undefined,
) {
    const [last, setLast] = useState<{ value: string; reason: string }>();
    return {
        onValueChange: (value: Value | null, details: ChangeDetails) =>
            setLast({
                value: value === null ? "none" : (print(value) ?? "none"),
                reason: details.reason,
            }),
        values: { value: last?.value, reason: last?.reason },
    };
}
