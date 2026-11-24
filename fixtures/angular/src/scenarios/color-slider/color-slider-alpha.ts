import { Component, ViewEncapsulation } from "@angular/core";
import {
    ColorSliderOutput,
    ColorSliderRoot,
    ColorSliderThumb,
    ColorSliderTrack,
} from "@fragiola/primitives-angular/color-slider";
import { colorSlider } from "examples-shared/recipes/color-slider";

/** spec/color-slider.md, `/color-slider/alpha` */
@Component({
    selector: "[scenario-color-slider-alpha]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        ColorSliderRoot,
        ColorSliderOutput,
        ColorSliderTrack,
        ColorSliderThumb,
    ],
    template: `
        <div colorSliderRoot channel="alpha" defaultValue="rgba(51, 102, 153, 0.5)" locale="de-DE" [class]="styles.root">
            <div colorSliderTrack data-testid="track" [class]="styles.track"><div colorSliderThumb aria-label="Opacity" [class]="styles.thumb"></div></div>
            <output colorSliderOutput [class]="styles.output"></output>
        </div>
    `,
})
export class ColorSliderAlpha {
    protected readonly styles = colorSlider;
}
