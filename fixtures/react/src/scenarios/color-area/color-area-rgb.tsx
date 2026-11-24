import { ColorArea } from "../../kit/ui/color-area.tsx";

/** spec/color-area.md, `/color-area/rgb` */
export function ColorAreaRgb() {
    return (
        <ColorArea.Root
            aria-label="Red and green"
            defaultValue="rgb(0, 0, 128)"
            xChannel="red"
            yChannel="green"
            data-testid="area"
        >
            <ColorArea.Thumb>
                <ColorArea.Input axis="x" aria-label="Red" />
                <ColorArea.Input axis="y" aria-label="Green" />
            </ColorArea.Thumb>
        </ColorArea.Root>
    );
}
