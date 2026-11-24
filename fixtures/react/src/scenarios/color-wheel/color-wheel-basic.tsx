import { type Color, formatColor } from "@fragiola/primitives/color";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { ColorWheel } from "../../kit/ui/color-wheel.tsx";

/** spec/color-wheel.md, `/color-wheel/basic` */
export function ColorWheelBasic() {
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
                <ColorWheel.Root
                    defaultValue="hsl(90, 100%, 50%)"
                    name="color"
                    locale="en-US"
                    outerRadius={100}
                    innerRadius={76}
                    data-testid="wheel"
                    onValueChange={(next: Color) => setValue(formatColor(next))}
                    onValueCommit={(next: Color) =>
                        setCommitted(formatColor(next))
                    }
                >
                    <ColorWheel.Track />
                    <ColorWheel.Thumb aria-label="Hue" />
                </ColorWheel.Root>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ value, committed, form }} />
        </>
    );
}
