import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    SliderControl,
    SliderIndicator,
    SliderLabel,
    SliderRoot,
    SliderThumb,
    SliderTrack,
} from "@fragiola/primitives-angular/slider";
import { slider } from "examples-shared/recipes/slider";

/** spec/slider.md, `/slider/thumb-name`: a bound Thumb name wins over the Label. */
@Component({
    selector: "[scenario-slider-thumb-name]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        SliderRoot,
        SliderLabel,
        SliderControl,
        SliderTrack,
        SliderIndicator,
        SliderThumb,
    ],
    template: `
        <div class="flex flex-col items-start gap-4">
            <div sliderRoot [defaultValue]="50" [class]="styles.root">
                <div sliderLabel [class]="styles.label">Volume</div>
                <div sliderControl [class]="styles.control"><div sliderTrack [class]="styles.track"><div sliderIndicator [class]="styles.indicator"></div><div sliderThumb [attr.aria-label]="name()" [class]="styles.thumb"></div></div></div>
            </div>
            <button type="button" (click)="name.set('Main volume')">Rename</button>
        </div>
    `,
})
export class SliderThumbName {
    protected readonly styles = slider;
    protected readonly name = signal("Master volume");
}
