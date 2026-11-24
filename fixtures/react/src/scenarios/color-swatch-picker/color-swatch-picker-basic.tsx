import { type Color, formatColor } from "@fragiola/primitives/color";
import type { ChangeDetails } from "@fragiola/primitives-react/color-swatch-picker";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { ColorSwatchPicker } from "../../kit/ui/color-swatch-picker.tsx";
import { Swatches } from "./swatches.tsx";

/** spec/color-swatch-picker.md, `/color-swatch-picker/basic`; also `/rtl` (the page sets `dir`). */
export function ColorSwatchPickerBasic() {
    const [value, setValue] = useState<string>();
    const [reason, setReason] = useState<string>();
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
                <h2 id="palette" className="text-sm font-semibold">
                    Palette
                </h2>
                <ColorSwatchPicker.Root
                    aria-labelledby="palette"
                    name="color"
                    onValueChange={(
                        next: Color | null,
                        details: ChangeDetails,
                    ) => {
                        setValue(
                            next === null
                                ? undefined
                                : formatColor(next, "hex"),
                        );
                        setReason(details.reason);
                    }}
                >
                    <Swatches />
                </ColorSwatchPicker.Root>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ value, reason, form }} />
        </>
    );
}
