import { type Color, formatColor } from "@fragiola/primitives/color";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { ColorSwatchPicker } from "../../kit/ui/color-swatch-picker.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { Swatches } from "./swatches.tsx";

/** spec/color-swatch-picker.md, `/color-swatch-picker/field` */
export function ColorSwatchPickerField() {
    const [value, setValue] = useState<string>();
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
                <Field.Root name="accent">
                    <Field.Label>Accent</Field.Label>
                    <ColorSwatchPicker.Root
                        defaultValue="#00ff00"
                        onValueChange={(next: Color | null) =>
                            setValue(
                                next === null
                                    ? undefined
                                    : formatColor(next, "hex"),
                            )
                        }
                    >
                        <Swatches />
                    </ColorSwatchPicker.Root>
                    <Field.Description>The links' color.</Field.Description>
                </Field.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ value, form }} />
        </>
    );
}
