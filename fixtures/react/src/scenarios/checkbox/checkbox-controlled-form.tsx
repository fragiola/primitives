import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Checkbox } from "../../kit/ui/checkbox.tsx";

/**
 * spec/checkbox.md, `/checkbox/controlled-form`: always checked, every change ignored (no render
 * follows a refused reset).
 */
export function CheckboxControlledForm() {
    const [form, setForm] = useState<string>();
    return (
        <>
            <form
                className="flex flex-col items-start gap-2"
                onSubmit={(event) => {
                    event.preventDefault();
                    setForm(formEntries(event.currentTarget));
                }}
            >
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox.Root
                        name="remember"
                        checked
                        onCheckedChange={() => {}}
                    />
                    Remember me
                </label>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ form }} />
        </>
    );
}
