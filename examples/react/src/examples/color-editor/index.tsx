import { type Color, formatColor } from "@fragiola/primitives/color";
import { ColorArea } from "@fragiola/primitives-react/color-area";
import { ColorField } from "@fragiola/primitives-react/color-field";
import { ColorSlider } from "@fragiola/primitives-react/color-slider";
import { ColorWheel } from "@fragiola/primitives-react/color-wheel";
import { type CSSProperties, useState } from "react";
import { styles } from "./styles.ts";

const INITIAL: Color = {
    space: "hsl",
    hue: 210,
    saturation: 80,
    lightness: 50,
    alpha: 1,
};

// An HSL editor: one color value shared by four controls (spec/color.md). The wheel picks the hue,
// the area its saturation and lightness, the slider its opacity, and the field reads and writes
// it as hex (Enter or leaving the field commits a typed color; an emptied field keeps the color).
// Each control reports the color in its own space; the swatch shows it.
export default function ColorEditor() {
    const [color, setColor] = useState<Color>(INITIAL);
    const css = formatColor(color, "css");
    return (
        <div className={styles.stack}>
            <div className={styles.row}>
                <ColorWheel.Root
                    value={color}
                    onValueChange={setColor}
                    colorSpace="hsl"
                    outerRadius={80}
                    innerRadius={60}
                    locale="en-US"
                    className={styles.wheel.root}
                >
                    <ColorWheel.Track className={styles.wheel.track} />
                    <ColorWheel.Thumb
                        aria-label="Hue"
                        className={styles.wheel.thumb}
                    />
                </ColorWheel.Root>
                <ColorArea.Root
                    value={color}
                    onValueChange={setColor}
                    colorSpace="hsl"
                    xChannel="saturation"
                    yChannel="lightness"
                    locale="en-US"
                    aria-label="Saturation and lightness"
                    className={styles.area.root}
                >
                    <ColorArea.Thumb className={styles.area.thumb}>
                        <ColorArea.Input axis="x" aria-label="Saturation" />
                        <ColorArea.Input axis="y" aria-label="Lightness" />
                    </ColorArea.Thumb>
                </ColorArea.Root>
            </div>
            <ColorSlider.Root
                value={color}
                onValueChange={setColor}
                channel="alpha"
                locale="en-US"
                className={styles.slider.root}
            >
                <ColorSlider.Label className={styles.slider.label}>
                    Opacity
                </ColorSlider.Label>
                <ColorSlider.Track className={styles.slider.track}>
                    <ColorSlider.Thumb className={styles.slider.thumb} />
                </ColorSlider.Track>
                <ColorSlider.Output className={styles.slider.output} />
            </ColorSlider.Root>
            <div className={styles.fieldRow}>
                <label htmlFor="color-hex" className={styles.label}>
                    Hex
                </label>
                <ColorField.Root
                    id="color-hex"
                    value={color}
                    onValueChange={(next) => {
                        if (next !== null) setColor(next);
                    }}
                    className={styles.field.root}
                >
                    <ColorField.Input className={styles.field.input} />
                </ColorField.Root>
                <div
                    className={styles.swatch}
                    style={{ "--swatch": css } as CSSProperties}
                />
                <output className={styles.value}>{css}</output>
            </div>
        </div>
    );
}
