import { Component } from "@angular/core";
import {
    SliderControl,
    SliderIndicator,
    SliderRoot,
    SliderThumb,
    SliderTrack,
} from "@fragiola/primitives-angular/slider";
import { styles } from "./styles.ts";

const price = (value: number) => `$${value}`;

// A volume and a price range: drag a thumb or press the track; the arrows step, Page Up and
// Page Down jump by ten, Home and End go to the bounds, and the price thumbs stay ten apart
// (spec/slider.md).
@Component({
    selector: "example-volume-and-price",
    imports: [
        SliderRoot,
        SliderControl,
        SliderTrack,
        SliderIndicator,
        SliderThumb,
    ],
    template: `
        <div [class]="styles.stack">
            <div [class]="styles.row">
                <span id="volume" [class]="styles.label">Volume</span>
                <div sliderRoot [defaultValue]="50" [class]="styles.root">
                    <div sliderControl [class]="styles.control">
                        <div sliderTrack [class]="styles.track"><div sliderIndicator [class]="styles.indicator"></div></div>
                        <div sliderThumb aria-labelledby="volume" [class]="styles.thumb"></div>
                    </div>
                </div>
            </div>
            <div [class]="styles.row">
                <span [class]="styles.label">Price</span>
                <div sliderRoot [defaultValue]="range" [minStepsBetweenValues]="10" [class]="styles.root">
                    <div sliderControl [class]="styles.control">
                        <div sliderTrack [class]="styles.track"><div sliderIndicator [class]="styles.indicator"></div></div>
                        <div sliderThumb aria-label="Minimum price" [getAriaValueText]="price" [class]="styles.thumb"></div>
                        <div sliderThumb aria-label="Maximum price" [getAriaValueText]="price" [class]="styles.thumb"></div>
                    </div>
                </div>
            </div>
        </div>
    `,
})
export default class VolumeAndPrice {
    protected readonly styles = styles;
    protected readonly range = [20, 80];
    protected readonly price = price;
}
