import { Component, signal, ViewEncapsulation } from "@angular/core";
import { type Color, formatColor } from "@fragiola/primitives/color";
import {
    ColorSliderRoot,
    ColorSliderThumb,
    ColorSliderTrack,
} from "@fragiola/primitives-angular/color-slider";
import { colorSlider } from "examples-shared/recipes/color-slider";
import { Output } from "../../kit/output.ts";

/** spec/color-slider.md, `/color-slider/vertical` */
@Component({
    selector: "[scenario-color-slider-vertical]",
    encapsulation: ViewEncapsulation.None,
    imports: [ColorSliderRoot, ColorSliderTrack, ColorSliderThumb, Output],
    template: `
        <div colorSliderRoot channel="brightness" defaultValue="hsb(210, 50%, 30%)" orientation="vertical" locale="en-US" (valueChange)="value.set(hsb($event))" [class]="styles.root">
            <div colorSliderTrack data-testid="track" [class]="styles.track"><div colorSliderThumb aria-label="Brightness" [class]="styles.thumb"></div></div>
        </div>
        <pre fixtureOutput [values]="{ value: value() }"></pre>
    `,
})
export class ColorSliderVertical {
    protected readonly styles = colorSlider;
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly hsb = (color: Color) => formatColor(color, "hsb");
}
