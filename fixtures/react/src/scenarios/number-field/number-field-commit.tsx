import type { ChangeDetails } from "@fragiola/primitives-react/number-field";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Label } from "../../kit/ui/label.tsx";
import { NumberField } from "../../kit/ui/number-field.tsx";
import { useNumberOutput } from "./use-number-output.ts";

/** spec/number-field.md, `/number-field/commit` */
export function NumberFieldCommit() {
    const output = useNumberOutput();
    const [commit, setCommit] = useState<{
        value: string;
        reason: string;
        count: number;
    }>();
    return (
        <>
            <form className="flex flex-col items-start gap-2">
                <Label htmlFor="amount">Amount</Label>
                <NumberField.Root
                    id="amount"
                    name="amount"
                    defaultValue={50}
                    min={0}
                    max={100}
                    locale="en-US"
                    onValueChange={output.onValueChange}
                    onValueCommitted={(
                        value: number | null,
                        details: ChangeDetails,
                    ) =>
                        setCommit((last) => ({
                            value: value === null ? "null" : String(value),
                            reason: details.reason,
                            count: (last?.count ?? 0) + 1,
                        }))
                    }
                >
                    <NumberField.Group>
                        <NumberField.Decrement aria-label="Decrease" />
                        <NumberField.Input />
                        <NumberField.Increment aria-label="Increase" />
                    </NumberField.Group>
                </NumberField.Root>
                <button type="reset">Reset</button>
            </form>
            <Output
                values={{
                    ...output.values,
                    committed: commit?.value,
                    commitReason: commit?.reason,
                    commits: commit?.count ?? 0,
                }}
            />
        </>
    );
}
