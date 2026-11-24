import { Component, signal, ViewEncapsulation } from "@angular/core";
import { type Color, formatColor } from "@fragiola/primitives/color";
import {
    ColorSliderRoot,
    ColorSliderThumb,
    ColorSliderTrack,
} from "@fragiola/primitives-angular/color-slider";
import { colorSlider } from "examples-shared/recipes/color-slider";
import { Output } from "../../kit/output.ts";

/** spec/color-slider.md, `/color-slider/space`: three sliders on one value, in two spaces. */
@Component({
    selector: "[scenario-color-slider-space]",
    encapsulation: ViewEncapsulation.None,
    imports: [ColorSliderRoot, ColorSliderTrack, ColorSliderThumb, Output],
    template: `
        <div class="flex flex-col items-start gap-2">
            <div colorSliderRoot channel="red" [value]="color()" locale="en-US" (valueChange)="change($event)" [class]="styles.root">
                <div colorSliderTrack [class]="styles.track"><div colorSliderThumb aria-label="Red" [class]="styles.thumb"></div></div>
            </div>
            <div colorSliderRoot channel="hue" colorSpace="hsl" [value]="color()" locale="en-US" (valueChange)="change($event)" [class]="styles.root">
                <div colorSliderTrack [class]="styles.track"><div colorSliderThumb aria-label="Hue" [class]="styles.thumb"></div></div>
            </div>
            <div colorSliderRoot channel="lightness" [value]="color()" locale="en-US" (valueChange)="change($event)" [class]="styles.root">
                <div colorSliderTrack [class]="styles.track"><div colorSliderThumb aria-label="Lightness" [class]="styles.thumb"></div></div>
            </div>
        </div>
        <pre fixtureOutput [values]="{ value: value() }"></pre>
    `,
})
export class ColorSliderSpace {
    protected readonly styles = colorSlider;
    protected readonly color = signal<Color | string>("#336699");
    protected readonly value = signal<string | undefined>(undefined);

    protected change(next: Color): void {
        this.color.set(next);
        this.value.set(formatColor(next));
    }
}
