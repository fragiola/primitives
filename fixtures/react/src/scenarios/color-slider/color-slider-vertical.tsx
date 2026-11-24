import { type Color, formatColor } from "@fragiola/primitives/color";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { ColorSlider } from "../../kit/ui/color-slider.tsx";

/** spec/color-slider.md, `/color-slider/vertical` */
export function ColorSliderVertical() {
    const [value, setValue] = useState<string>();
    return (
        <>
            <ColorSlider.Root
                channel="brightness"
                defaultValue="hsb(210, 50%, 30%)"
                orientation="vertical"
                locale="en-US"
                onValueChange={(next: Color) =>
                    setValue(formatColor(next, "hsb"))
                }
            >
                <ColorSlider.Track data-testid="track">
                    <ColorSlider.Thumb aria-label="Brightness" />
                </ColorSlider.Track>
            </ColorSlider.Root>
            <Output values={{ value }} />
        </>
    );
}
