import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { Radio, RadioGroup } from "../../kit/ui/radio-group.tsx";
import { Switch } from "../../kit/ui/switch.tsx";

export function FieldSettings() {
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
                <Field.Root name="contact">
                    <Field.Label>Contact by</Field.Label>
                    <RadioGroup required>
                        <label className="flex items-center gap-2 text-sm">
                            <Radio.Root value="email" />
                            Email
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <Radio.Root value="phone" />
                            Phone
                        </label>
                    </RadioGroup>
                    <Field.Description>How we reach you.</Field.Description>
                    <Field.Error>Choose how we reach you.</Field.Error>
                </Field.Root>
                <Field.Root name="alerts">
                    <div className="flex items-center gap-2">
                        <Switch.Root uncheckedValue="off" />
                        <Field.Label>Email alerts</Field.Label>
                    </div>
                    <Field.Description>A weekly digest.</Field.Description>
                </Field.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ form }} />
        </>
    );
}
