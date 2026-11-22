import { Component } from "@angular/core";
import {
    SliderControl,
    SliderIndicator,
    SliderLabel,
    SliderRoot,
    SliderThumb,
    SliderTrack,
    SliderValue,
} from "@fragiola/primitives-angular/slider";
import { styles } from "./styles.ts";

/** US dollars, with no cents: the Value and the thumbs' `aria-valuetext`. */
const DOLLARS: Intl.NumberFormatOptions = {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
};

// A volume and a price range, each named by its label and showing its formatted value: drag a
// thumb or press the track; the arrows step, Page Up and Page Down jump by ten, Home and End go to
// the bounds, and the price thumbs stay ten apart (spec/slider.md).
@Component({
    selector: "example-volume-and-price",
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
        <div [class]="styles.stack">
            <div sliderRoot [defaultValue]="50" [class]="styles.root">
                <div sliderLabel [class]="styles.label">Volume</div>
                <div sliderControl [class]="styles.control">
                    <div sliderTrack [class]="styles.track"><div sliderIndicator [class]="styles.indicator"></div></div>
                    <div sliderThumb [class]="styles.thumb"></div>
                </div>
                <output sliderValue [class]="styles.value"></output>
            </div>
            <div sliderRoot [defaultValue]="range" [minStepsBetweenValues]="10" [format]="dollars" locale="en-US" [class]="styles.root">
                <div sliderLabel [class]="styles.label">Price</div>
                <div sliderControl [class]="styles.control">
                    <div sliderTrack [class]="styles.track"><div sliderIndicator [class]="styles.indicator"></div></div>
                    <div sliderThumb aria-label="Minimum price" [class]="styles.thumb"></div>
                    <div sliderThumb aria-label="Maximum price" [class]="styles.thumb"></div>
                </div>
                <output sliderValue [class]="styles.value"></output>
            </div>
        </div>
    `,
})
export default class VolumeAndPrice {
    protected readonly styles = styles;
    protected readonly range = [20, 80];
    protected readonly dollars = DOLLARS;
}
