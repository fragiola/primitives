import { Component, ViewEncapsulation } from "@angular/core";
import {
    ColorWheelRoot,
    ColorWheelThumb,
    ColorWheelTrack,
} from "@fragiola/primitives-angular/color-wheel";
import { colorWheel } from "examples-shared/recipes/color-wheel";

/** spec/color-wheel.md, `/color-wheel/disabled` */
@Component({
    selector: "[scenario-color-wheel-disabled]",
    encapsulation: ViewEncapsulation.None,
    imports: [ColorWheelRoot, ColorWheelTrack, ColorWheelThumb],
    template: `
        <div colorWheelRoot defaultValue="hsb(200, 100%, 100%)" [disabled]="true" [outerRadius]="100" [innerRadius]="76" data-testid="wheel" [class]="styles.root">
            <div colorWheelTrack [class]="styles.track"></div>
            <div colorWheelThumb aria-label="Hue" [class]="styles.thumb"></div>
        </div>
    `,
})
export class ColorWheelDisabled {
    protected readonly styles = colorWheel;
}
