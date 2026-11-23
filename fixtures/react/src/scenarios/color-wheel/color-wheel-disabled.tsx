import { ColorWheel } from "../../kit/ui/color-wheel.tsx";

/** spec/color-wheel.md, `/color-wheel/disabled` */
export function ColorWheelDisabled() {
    return (
        <ColorWheel.Root
            defaultValue="hsb(200, 100%, 100%)"
            disabled
            outerRadius={100}
            innerRadius={76}
            data-testid="wheel"
        >
            <ColorWheel.Track />
            <ColorWheel.Thumb aria-label="Hue" />
        </ColorWheel.Root>
    );
}
