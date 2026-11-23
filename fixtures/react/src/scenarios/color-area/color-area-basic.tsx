import { type Color, formatColor } from "@fragiola/primitives/color";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { ColorArea } from "../../kit/ui/color-area.tsx";

/** spec/color-area.md, `/color-area/basic`; also `/color-area/rtl` (the page sets `dir`). */
export function ColorAreaBasic() {
    const [value, setValue] = useState<string>();
    const [committed, setCommitted] = useState<string>();
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
                <ColorArea.Root
                    aria-label="Color"
                    defaultValue="hsb(210, 50%, 50%)"
                    xChannel="saturation"
                    yChannel="brightness"
                    locale="en-US"
                    data-testid="area"
                    onValueChange={(next: Color) =>
                        setValue(formatColor(next, "hsb"))
                    }
                    onValueCommit={(next: Color) =>
                        setCommitted(formatColor(next, "hsb"))
                    }
                >
                    <ColorArea.Thumb>
                        <ColorArea.Input
                            axis="x"
                            name="saturation"
                            aria-label="Saturation"
                        />
                        <ColorArea.Input
                            axis="y"
                            name="brightness"
                            aria-label="Brightness"
                        />
                    </ColorArea.Thumb>
                </ColorArea.Root>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ value, committed, form }} />
        </>
    );
}
