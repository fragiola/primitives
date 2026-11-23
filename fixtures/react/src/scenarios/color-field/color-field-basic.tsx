import { type Color, formatColor } from "@fragiola/primitives/color";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { ColorField } from "../../kit/ui/color-field.tsx";

/** spec/color-field.md, `/color-field/basic` */
export function ColorFieldBasic() {
    const [value, setValue] = useState<string | null>();
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
                <label htmlFor="color">Color</label>
                <ColorField.Root
                    id="color"
                    defaultValue="#336699"
                    name="color"
                    onValueChange={(next: Color | null) =>
                        setValue(
                            next === null ? null : formatColor(next, "hex"),
                        )
                    }
                >
                    <ColorField.Input />
                </ColorField.Root>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ value, form }} />
        </>
    );
}
