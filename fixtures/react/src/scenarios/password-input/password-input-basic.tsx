import type { ChangeDetails } from "@fragiola/primitives-react/password-input";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { PasswordInput } from "../../kit/ui/password-input.tsx";

/** A password in a native form (spec/password-input.md, `/password-input/basic`). */
export function PasswordInputBasic() {
    const [value, setValue] = useState<string>();
    const [visible, setVisible] = useState<boolean>();
    const [reason, setReason] = useState<string>();
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
                <label htmlFor="password" className="text-sm font-medium">
                    Password
                </label>
                <PasswordInput.Root
                    id="password"
                    name="password"
                    onValueChange={(next: string, details: ChangeDetails) => {
                        setValue(next);
                        setReason(details.reason);
                    }}
                    onVisibleChange={(
                        next: boolean,
                        details: ChangeDetails,
                    ) => {
                        setVisible(next);
                        setReason(details.reason);
                    }}
                >
                    <PasswordInput.Input autoComplete="current-password" />
                    <PasswordInput.VisibilityTrigger aria-label="Show password" />
                </PasswordInput.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ value, visible, reason, form }} />
        </>
    );
}
