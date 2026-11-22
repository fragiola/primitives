import { Component, ViewEncapsulation } from "@angular/core";
import {
    SliderControl,
    SliderIndicator,
    SliderLabel,
    SliderRoot,
    SliderThumb,
    SliderTrack,
    SliderValue,
} from "@fragiola/primitives-angular/slider";
import { slider } from "examples-shared/recipes/slider";

const PERCENT: Intl.NumberFormatOptions = { style: "percent" };
const EUROS: Intl.NumberFormatOptions = {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
};

/** A Label and a formatted Value, for one thumb and for a range (spec/slider.md). */
@Component({
    selector: "[scenario-slider-label-value]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        SliderRoot,
        SliderLabel,
        SliderValue,
        SliderControl,
        SliderTrack,
        SliderIndicator,
        SliderThumb,
    ],
    template: `
        <div class="flex flex-col items-start gap-4">
            <div sliderRoot [min]="0" [max]="1" [step]="0.01" [defaultValue]="0.5" [format]="percent" locale="en-US" [class]="styles.root">
                <div sliderLabel [class]="styles.label">Volume</div>
                <div sliderControl [class]="styles.control"><div sliderTrack [class]="styles.track"><div sliderIndicator [class]="styles.indicator"></div><div sliderThumb [class]="styles.thumb"></div></div></div>
                <output sliderValue [class]="styles.value"></output>
            </div>
            <div sliderRoot [defaultValue]="initial" [format]="euros" locale="de-DE" [class]="styles.root">
                <div sliderLabel [class]="styles.label">Price</div>
                <div sliderControl [class]="styles.control"><div sliderTrack [class]="styles.track"><div sliderIndicator [class]="styles.indicator"></div><div sliderThumb aria-label="Minimum price" [class]="styles.thumb"></div><div sliderThumb aria-label="Maximum price" [class]="styles.thumb"></div></div></div>
                <output sliderValue [class]="styles.value"></output>
            </div>
        </div>
    `,
})
export class SliderLabelValue {
    protected readonly styles = slider;
    protected readonly percent = PERCENT;
    protected readonly euros = EUROS;
    protected readonly initial = [20, 80];
}
