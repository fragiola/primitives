import { type Color, formatColor } from "@fragiola/primitives/color";
import type { OpenChangeDetails } from "@fragiola/primitives-react/color-picker-popover";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { ColorArea } from "../../kit/ui/color-area.tsx";
import { ColorField } from "../../kit/ui/color-field.tsx";
import { ColorPicker, ColorPickerPopover } from "../../kit/ui/color-picker.tsx";
import { ColorSlider } from "../../kit/ui/color-slider.tsx";
import { ColorSwatch } from "../../kit/ui/color-swatch.tsx";

/** spec/color-picker.md, `/color-picker/popover`: the picker in its opt-in popup. */
export function ColorPickerPopoverScenario() {
    const [value, setValue] = useState<string>();
    const [open, setOpen] = useState<boolean>();
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
                <ColorPicker.Root
                    defaultValue="#336699"
                    name="accent"
                    onValueChange={(next: Color) =>
                        setValue(formatColor(next, "hex"))
                    }
                >
                    <ColorPickerPopover.Root
                        onOpenChange={(
                            next: boolean,
                            details: OpenChangeDetails,
                        ) => {
                            setOpen(next);
                            setReason(details.reason);
                        }}
                    >
                        <ColorPickerPopover.Trigger aria-label="Accent color">
                            <ColorSwatch />
                        </ColorPickerPopover.Trigger>
                        <ColorPickerPopover.Portal>
                            <ColorPickerPopover.Positioner sideOffset={8}>
                                <ColorPickerPopover.Popup aria-label="Accent color picker">
                                    <ColorArea.Root
                                        xChannel="saturation"
                                        yChannel="brightness"
                                        locale="en-US"
                                    >
                                        <ColorArea.Thumb>
                                            <ColorArea.Input
                                                axis="x"
                                                aria-label="Saturation"
                                            />
                                            <ColorArea.Input
                                                axis="y"
                                                aria-label="Brightness"
                                            />
                                        </ColorArea.Thumb>
                                    </ColorArea.Root>
                                    <ColorSlider.Root
                                        channel="hue"
                                        locale="en-US"
                                    >
                                        <ColorSlider.Track>
                                            <ColorSlider.Thumb aria-label="Hue" />
                                        </ColorSlider.Track>
                                    </ColorSlider.Root>
                                    <ColorField.Root>
                                        <ColorField.Input aria-label="Hex" />
                                    </ColorField.Root>
                                </ColorPickerPopover.Popup>
                            </ColorPickerPopover.Positioner>
                        </ColorPickerPopover.Portal>
                    </ColorPickerPopover.Root>
                </ColorPicker.Root>
                <div className="flex gap-2">
                    <button type="button">After</button>
                    <button type="submit">Submit</button>
                </div>
            </form>
            <Output values={{ value, open, reason, form }} />
        </>
    );
}
