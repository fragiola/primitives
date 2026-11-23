import { type Color, formatColor } from "@fragiola/primitives/color";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { ColorSlider } from "../../kit/ui/color-slider.tsx";

/** spec/color-slider.md, `/color-slider/space`: three sliders on one value, in two spaces. */
export function ColorSliderSpace() {
    const [color, setColor] = useState<Color | string>("#336699");
    const [value, setValue] = useState<string>();
    const onValueChange = (next: Color) => {
        setColor(next);
        setValue(formatColor(next));
    };
    return (
        <>
            <div className="flex flex-col items-start gap-2">
                <ColorSlider.Root
                    channel="red"
                    value={color}
                    locale="en-US"
                    onValueChange={onValueChange}
                >
                    <ColorSlider.Track>
                        <ColorSlider.Thumb aria-label="Red" />
                    </ColorSlider.Track>
                </ColorSlider.Root>
                <ColorSlider.Root
                    channel="hue"
                    colorSpace="hsl"
                    value={color}
                    locale="en-US"
                    onValueChange={onValueChange}
                >
                    <ColorSlider.Track>
                        <ColorSlider.Thumb aria-label="Hue" />
                    </ColorSlider.Track>
                </ColorSlider.Root>
                <ColorSlider.Root
                    channel="lightness"
                    value={color}
                    locale="en-US"
                    onValueChange={onValueChange}
                >
                    <ColorSlider.Track>
                        <ColorSlider.Thumb aria-label="Lightness" />
                    </ColorSlider.Track>
                </ColorSlider.Root>
            </div>
            <Output values={{ value }} />
        </>
    );
}
