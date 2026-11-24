import { type Color, formatColor } from "@fragiola/primitives/color";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { ColorArea } from "../../kit/ui/color-area.tsx";
import { ColorField } from "../../kit/ui/color-field.tsx";
import { ColorPicker } from "../../kit/ui/color-picker.tsx";
import { ColorSlider } from "../../kit/ui/color-slider.tsx";
import { ColorSwatch } from "../../kit/ui/color-swatch.tsx";
import { ColorSwatchPicker } from "../../kit/ui/color-swatch-picker.tsx";
import { Swatches } from "../color-swatch-picker/swatches.tsx";

const PRESETS = [
    { name: "Red", color: "#ff0000" },
    { name: "Green", color: "#00ff00" },
    { name: "Blue", color: "#0000ff" },
];

/** spec/color-picker.md, `/color-picker/basic`: one color shared by the controls inside it. */
export function ColorPickerBasic() {
    const [value, setValue] = useState<string>();
    const [space, setSpace] = useState<string>();
    const [committed, setCommitted] = useState<string>();
    const [format, setFormat] = useState<string>();
    const [own, setOwn] = useState<string>();
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
                <ColorPicker.Root
                    aria-label="Theme color"
                    defaultValue="hsb(210, 50%, 60%)"
                    name="color"
                    onValueChange={(next: Color) => {
                        setValue(formatColor(next, "hex"));
                        setSpace(next.space);
                    }}
                    onValueCommit={(next: Color) =>
                        setCommitted(formatColor(next, "hex"))
                    }
                    onFormatChange={(next: string) => setFormat(next)}
                >
                    <ColorArea.Root
                        xChannel="saturation"
                        yChannel="brightness"
                        locale="en-US"
                    >
                        <ColorArea.Thumb>
                            <ColorArea.Input axis="x" aria-label="Saturation" />
                            <ColorArea.Input axis="y" aria-label="Brightness" />
                        </ColorArea.Thumb>
                    </ColorArea.Root>
                    <ColorSlider.Root channel="hue" locale="en-US">
                        <ColorSlider.Track>
                            <ColorSlider.Thumb aria-label="Hue" />
                        </ColorSlider.Track>
                    </ColorSlider.Root>
                    <ColorSlider.Root channel="alpha" locale="en-US">
                        <ColorSlider.Track>
                            <ColorSlider.Thumb aria-label="Opacity" />
                        </ColorSlider.Track>
                    </ColorSlider.Root>
                    <ColorField.Root>
                        <ColorField.Input aria-label="Hex" />
                    </ColorField.Root>
                    <ColorSwatch aria-label="Current color" />
                    <ColorSwatchPicker.Root aria-label="Presets">
                        <Swatches swatches={PRESETS} />
                    </ColorSwatchPicker.Root>
                    <ColorPicker.FormatSelect aria-label="Format">
                        <option value="hex">Hex</option>
                        <option value="rgb">RGB</option>
                        <option value="hsl">HSL</option>
                        <option value="hsb">HSB</option>
                    </ColorPicker.FormatSelect>
                    <ColorPicker.EyeDropperTrigger>
                        Pick a color
                    </ColorPicker.EyeDropperTrigger>
                    <ColorSlider.Root
                        channel="hue"
                        defaultValue="hsl(0, 100%, 50%)"
                        locale="en-US"
                        onValueChange={(next: Color) =>
                            setOwn(formatColor(next))
                        }
                    >
                        <ColorSlider.Track>
                            <ColorSlider.Thumb aria-label="Own hue" />
                        </ColorSlider.Track>
                    </ColorSlider.Root>
                </ColorPicker.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ value, space, committed, format, own, form }} />
        </>
    );
}
