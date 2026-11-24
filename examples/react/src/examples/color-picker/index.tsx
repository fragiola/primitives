import {
    type Color,
    type ColorChannel,
    formatColor,
} from "@fragiola/primitives/color";
import { ColorArea } from "@fragiola/primitives-react/color-area";
import { ColorField } from "@fragiola/primitives-react/color-field";
import {
    ColorPicker,
    type ColorPickerFormat,
} from "@fragiola/primitives-react/color-picker";
import { ColorPickerPopover } from "@fragiola/primitives-react/color-picker-popover";
import { ColorSlider } from "@fragiola/primitives-react/color-slider";
import { ColorSwatch } from "@fragiola/primitives-react/color-swatch";
import { ColorSwatchPicker } from "@fragiola/primitives-react/color-swatch-picker";
import { useState } from "react";
import { styles } from "./styles.ts";

const VIOLET: Color = {
    space: "rgb",
    red: 124,
    green: 58,
    blue: 237,
    alpha: 1,
};

const PRESETS = [
    { name: "Violet", color: "#7c3aed" },
    { name: "Blue", color: "#2563eb" },
    { name: "Teal", color: "#0d9488" },
    { name: "Green", color: "#16a34a" },
    { name: "Amber", color: "#d97706" },
    { name: "Red", color: "#dc2626" },
    { name: "Pink", color: "#db2777" },
    { name: "Slate", color: "#475569" },
];

/** The channel fields of each format, with their names (the app's: spec/color.md, "Channels"). */
const CHANNELS: Record<
    Exclude<ColorPickerFormat, "hex">,
    readonly [ColorChannel, string][]
> = {
    rgb: [
        ["red", "Red"],
        ["green", "Green"],
        ["blue", "Blue"],
    ],
    hsl: [
        ["hue", "Hue"],
        ["saturation", "Saturation"],
        ["lightness", "Lightness"],
    ],
    hsb: [
        ["hue", "Hue"],
        ["saturation", "Saturation"],
        ["brightness", "Brightness"],
    ],
};

// A theme color picker (spec/color-picker.md): the picker holds one color, every control inside
// its popup is bound to it (none is given a value of its own), and the format select chooses which
// fields edit it. The trigger shows the color; the preview uses the picker's CSS variable.
export default function ThemeColorPicker() {
    const [color, setColor] = useState<Color>(VIOLET);
    const [format, setFormat] = useState<ColorPickerFormat>("hex");
    return (
        <ColorPicker.Root
            value={color}
            onValueChange={setColor}
            format={format}
            onFormatChange={setFormat}
            className={styles.picker.root}
        >
            <div className={styles.row}>
                <ColorPickerPopover.Root>
                    <ColorPickerPopover.Trigger
                        className={styles.popover.trigger}
                    >
                        <ColorSwatch
                            aria-hidden="true"
                            className={styles.swatch.root}
                        />
                        <span className={styles.label}>Theme color</span>
                        <span className={styles.hex}>
                            {formatColor(color, "hex")}
                        </span>
                    </ColorPickerPopover.Trigger>
                    <ColorPickerPopover.Portal>
                        <ColorPickerPopover.Positioner
                            sideOffset={8}
                            className={styles.popover.positioner}
                        >
                            <ColorPickerPopover.Popup
                                aria-label="Theme color picker"
                                className={styles.popover.popup}
                            >
                                <div className={styles.columns}>
                                    <div className={styles.column}>
                                        <ColorArea.Root
                                            xChannel="saturation"
                                            yChannel="brightness"
                                            className={styles.area.root}
                                        >
                                            <ColorArea.Thumb
                                                className={styles.area.thumb}
                                            >
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
                                            className={styles.slider.root}
                                        >
                                            <ColorSlider.Track
                                                className={styles.slider.track}
                                            >
                                                <ColorSlider.Thumb
                                                    aria-label="Hue"
                                                    className={
                                                        styles.slider.thumb
                                                    }
                                                />
                                            </ColorSlider.Track>
                                        </ColorSlider.Root>
                                        <ColorSlider.Root
                                            channel="alpha"
                                            className={styles.slider.root}
                                        >
                                            <ColorSlider.Track
                                                className={styles.slider.track}
                                            >
                                                <ColorSlider.Thumb
                                                    aria-label="Opacity"
                                                    className={
                                                        styles.slider.thumb
                                                    }
                                                />
                                            </ColorSlider.Track>
                                        </ColorSlider.Root>
                                    </div>
                                    <div className={styles.column}>
                                        <div className={styles.row}>
                                            <ColorPicker.FormatSelect
                                                aria-label="Format"
                                                className={styles.formatSelect}
                                            >
                                                <option value="hex">Hex</option>
                                                <option value="rgb">RGB</option>
                                                <option value="hsl">HSL</option>
                                                <option value="hsb">HSB</option>
                                            </ColorPicker.FormatSelect>
                                            {format === "hex" ? (
                                                <ColorField.Root
                                                    className={
                                                        styles.field.root
                                                    }
                                                >
                                                    <ColorField.Input
                                                        aria-label="Hex"
                                                        className={
                                                            styles.field.input
                                                        }
                                                    />
                                                </ColorField.Root>
                                            ) : (
                                                <div
                                                    className={styles.channels}
                                                >
                                                    {CHANNELS[format].map(
                                                        ([channel, name]) => (
                                                            <ColorField.Root
                                                                key={channel}
                                                                channel={
                                                                    channel
                                                                }
                                                                colorSpace={
                                                                    format
                                                                }
                                                                className={
                                                                    styles.field
                                                                        .root
                                                                }
                                                            >
                                                                <ColorField.Input
                                                                    aria-label={
                                                                        name
                                                                    }
                                                                    className={
                                                                        styles.channelInput
                                                                    }
                                                                />
                                                            </ColorField.Root>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <ColorSwatchPicker.Root
                                            aria-label="Presets"
                                            className={styles.swatches.root}
                                        >
                                            {PRESETS.map((preset) => (
                                                <ColorSwatchPicker.Item
                                                    key={preset.color}
                                                    value={preset.color}
                                                    className={
                                                        styles.swatches.item
                                                    }
                                                >
                                                    <ColorSwatch
                                                        color={preset.color}
                                                        aria-label={preset.name}
                                                        className={
                                                            styles.swatch.root
                                                        }
                                                    />
                                                </ColorSwatchPicker.Item>
                                            ))}
                                        </ColorSwatchPicker.Root>
                                        <ColorPicker.EyeDropperTrigger
                                            className={styles.eyeDropper}
                                        >
                                            Pick from the screen
                                        </ColorPicker.EyeDropperTrigger>
                                    </div>
                                </div>
                            </ColorPickerPopover.Popup>
                        </ColorPickerPopover.Positioner>
                    </ColorPickerPopover.Portal>
                </ColorPickerPopover.Root>
            </div>
            <div className={styles.preview}>Preview</div>
        </ColorPicker.Root>
    );
}
