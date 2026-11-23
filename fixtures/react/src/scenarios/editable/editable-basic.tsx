import type { ChangeDetails } from "@fragiola/primitives-react/editable";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Editable } from "../../kit/ui/editable.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { printEnd, printText } from "./editable-output.ts";

/** An inline-editable title in a form (spec/editable.md, `/editable/basic`). */
export function EditableBasic() {
    const [value, setValue] = useState<string>();
    const [commit, setCommit] = useState<string>();
    const [revert, setRevert] = useState<string>();
    const [form, setForm] = useState<string>();
    return (
        <>
            <form
                className="flex flex-col items-start gap-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    setForm(formEntries(event.currentTarget));
                }}
            >
                <Field.Root>
                    <Field.Label>Title</Field.Label>
                    <Editable.Root
                        name="title"
                        defaultValue="Quarterly report"
                        placeholder="Untitled"
                        onValueChange={(next: string) =>
                            setValue(printText(next))
                        }
                        onValueCommit={(next: string, details: ChangeDetails) =>
                            setCommit(printEnd(next, details))
                        }
                        onValueRevert={(next: string, details: ChangeDetails) =>
                            setRevert(printEnd(next, details))
                        }
                    >
                        <Editable.Area>
                            <Editable.Preview />
                            <Editable.Input />
                        </Editable.Area>
                        <Editable.EditTrigger aria-label="Edit title" />
                        <Editable.SubmitTrigger aria-label="Save title" />
                        <Editable.CancelTrigger aria-label="Cancel edit" />
                    </Editable.Root>
                </Field.Root>
                <button type="button">After</button>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ value, commit, revert, form }} />
        </>
    );
}
