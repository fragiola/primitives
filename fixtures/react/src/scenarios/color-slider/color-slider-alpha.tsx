import { ColorSlider } from "../../kit/ui/color-slider.tsx";

/** spec/color-slider.md, `/color-slider/alpha` */
export function ColorSliderAlpha() {
    return (
        <ColorSlider.Root
            channel="alpha"
            defaultValue="rgba(51, 102, 153, 0.5)"
            locale="de-DE"
        >
            <ColorSlider.Track data-testid="track">
                <ColorSlider.Thumb aria-label="Opacity" />
            </ColorSlider.Track>
            <ColorSlider.Output />
        </ColorSlider.Root>
    );
}
