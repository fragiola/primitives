import { ColorSwatch } from "../../kit/ui/color-swatch.tsx";

/** spec/color-swatch.md, `/color-swatch/basic` */
export function ColorSwatchBasic() {
    return (
        <div className="flex items-center gap-2">
            <ColorSwatch color="#336699" aria-label="Ocean" />
            <ColorSwatch color="rgba(255, 0, 0, 0.5)" />
            <ColorSwatch color="hsl(120, 100%, 25%)" aria-label="Forest" />
        </div>
    );
}
