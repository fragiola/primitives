import type {
    ChangeDetails,
    EditableRootProps,
} from "@fragiola/primitives-react/editable";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Editable } from "../../kit/ui/editable.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { printEnd, printText } from "./editable-output.ts";

type Printed = Record<string, string | undefined>;

/** One Root of the page, printing its value, commit and revert under its label. */
function Mode({
    label,
    print,
    textarea = false,
    trigger,
    ...props
}: EditableRootProps & {
    label: string;
    print: (key: string, text: string) => void;
    textarea?: boolean;
    trigger?: string;
}) {
    return (
        <Field.Root>
            <Field.Label>{label}</Field.Label>
            <Editable.Root
                {...props}
                onValueChange={(next: string) =>
                    print(`${label} value`, printText(next))
                }
                onValueCommit={(next: string, details: ChangeDetails) =>
                    print(`${label} commit`, printEnd(next, details))
                }
                onValueRevert={(next: string, details: ChangeDetails) =>
                    print(`${label} revert`, printEnd(next, details))
                }
            >
                <Editable.Area>
                    <Editable.Preview />
                    {textarea ? (
                        <Editable.Input render={<textarea />} />
                    ) : (
                        <Editable.Input />
                    )}
                </Editable.Area>
                {trigger === undefined ? null : (
                    <>
                        <Editable.EditTrigger aria-label={`Edit ${trigger}`} />
                        <Editable.SubmitTrigger
                            aria-label={`Save ${trigger}`}
                        />
                    </>
                )}
            </Editable.Root>
        </Field.Root>
    );
}

/** Every activation and submit mode (spec/editable.md, `/editable/modes`). */
export function EditableModes() {
    const [printed, setPrinted] = useState<Printed>({});
    const print = (key: string, text: string) =>
        setPrinted((current) => ({ ...current, [key]: text }));
    const keys = ["Name", "Role", "Team", "Notes"].flatMap((label) => [
        `${label} value`,
        `${label} commit`,
        `${label} revert`,
    ]);
    return (
        <>
            <div className="flex flex-col items-start gap-4">
                <Mode
                    label="Name"
                    print={print}
                    defaultValue="Ana"
                    activationMode="dblclick"
                    submitMode="enter"
                />
                <Mode
                    label="Role"
                    print={print}
                    defaultValue="Designer"
                    activationMode="click"
                    submitMode="blur"
                />
                <Mode
                    label="Team"
                    print={print}
                    defaultValue="Core"
                    activationMode="none"
                    submitMode="none"
                    trigger="team"
                />
                <Mode
                    label="Notes"
                    print={print}
                    defaultValue="First line"
                    textarea
                />
                <button type="button">After</button>
            </div>
            <Output
                values={Object.fromEntries(
                    keys.map((key) => [key, printed[key]]),
                )}
            />
        </>
    );
}
