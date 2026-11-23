import { type Color, formatColor } from "@fragiola/primitives/color";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { ColorSlider } from "../../kit/ui/color-slider.tsx";

/** spec/color-slider.md, `/color-slider/basic`; also `/color-slider/rtl` (the page sets `dir`). */
export function ColorSliderBasic() {
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
                <ColorSlider.Root
                    channel="hue"
                    defaultValue="hsl(0, 100%, 50%)"
                    name="color"
                    locale="en-US"
                    onValueChange={(next: Color) => setValue(formatColor(next))}
                    onValueCommit={(next: Color) =>
                        setCommitted(formatColor(next))
                    }
                >
                    <ColorSlider.Label>Hue</ColorSlider.Label>
                    <ColorSlider.Track data-testid="track">
                        <ColorSlider.Thumb />
                    </ColorSlider.Track>
                    <ColorSlider.Output />
                </ColorSlider.Root>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ value, committed, form }} />
        </>
    );
}
