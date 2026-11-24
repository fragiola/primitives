import { type Color, formatColor } from "@fragiola/primitives/color";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { ColorField } from "../../kit/ui/color-field.tsx";
import { ColorPicker, ColorPickerPopover } from "../../kit/ui/color-picker.tsx";
import { ColorSlider } from "../../kit/ui/color-slider.tsx";
import { ColorSwatch } from "../../kit/ui/color-swatch.tsx";
import { Field } from "../../kit/ui/field.tsx";

/** spec/color-picker.md, `/color-picker/field` */
export function ColorPickerField() {
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
                <Field.Root name="brand">
                    <Field.Label>Brand color</Field.Label>
                    <ColorPicker.Root
                        defaultValue="#336699"
                        onValueChange={(next: Color) =>
                            setValue(formatColor(next, "hex"))
                        }
                    >
                        <ColorSlider.Root
                            channel="hue"
                            name="hue"
                            locale="en-US"
                        >
                            <ColorSlider.Track>
                                <ColorSlider.Thumb aria-label="Hue" />
                            </ColorSlider.Track>
                        </ColorSlider.Root>
                        <ColorSwatch aria-label="Brand color preview" />
                        <ColorPickerPopover.Root>
                            <ColorPickerPopover.Trigger>
                                More options
                            </ColorPickerPopover.Trigger>
                            <ColorPickerPopover.Portal>
                                <ColorPickerPopover.Positioner sideOffset={8}>
                                    <ColorPickerPopover.Popup aria-label="More">
                                        <ColorField.Root>
                                            <ColorField.Input aria-label="Hex" />
                                        </ColorField.Root>
                                    </ColorPickerPopover.Popup>
                                </ColorPickerPopover.Positioner>
                            </ColorPickerPopover.Portal>
                        </ColorPickerPopover.Root>
                    </ColorPicker.Root>
                    <Field.Description>Used for links.</Field.Description>
                </Field.Root>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ value, form }} />
        </>
    );
}
