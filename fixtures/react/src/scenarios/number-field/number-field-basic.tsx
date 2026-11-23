import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Label } from "../../kit/ui/label.tsx";
import { NumberField } from "../../kit/ui/number-field.tsx";
import { useNumberOutput } from "./use-number-output.ts";

/** spec/number-field.md, `/number-field/basic` */
export function NumberFieldBasic() {
    const output = useNumberOutput();
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
                <Label htmlFor="quantity">Quantity</Label>
                <NumberField.Root
                    id="quantity"
                    name="quantity"
                    defaultValue={1}
                    min={1}
                    max={10}
                    largeStep={5}
                    locale="en-US"
                    onValueChange={output.onValueChange}
                >
                    <NumberField.Group>
                        <NumberField.Decrement aria-label="Decrease" />
                        <NumberField.Input />
                        <NumberField.Increment aria-label="Increase" />
                    </NumberField.Group>
                </NumberField.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ ...output.values, form }} />
        </>
    );
}
