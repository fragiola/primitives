import { type Color, formatColor } from "@fragiola/primitives/color";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { ColorField } from "../../kit/ui/color-field.tsx";

/** spec/color-field.md, `/color-field/channel` */
export function ColorFieldChannel() {
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
                <ColorField.Root
                    channel="hue"
                    defaultValue="hsl(120, 50%, 50%)"
                    locale="en-US"
                    name="hue"
                    onValueChange={(next: Color | null) =>
                        setValue(next === null ? undefined : formatColor(next))
                    }
                >
                    <ColorField.Input aria-label="Hue" />
                </ColorField.Root>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ value, form }} />
        </>
    );
}
