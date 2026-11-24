import { Component, computed, signal } from "@angular/core";
import { type Color, formatColor } from "@fragiola/primitives/color";
import {
    ColorAreaInput,
    ColorAreaRoot,
    ColorAreaThumb,
} from "@fragiola/primitives-angular/color-area";
import {
    ColorFieldInput,
    ColorFieldRoot,
} from "@fragiola/primitives-angular/color-field";
import {
    ColorSliderLabel,
    ColorSliderOutput,
    ColorSliderRoot,
    ColorSliderThumb,
    ColorSliderTrack,
} from "@fragiola/primitives-angular/color-slider";
import {
    ColorWheelRoot,
    ColorWheelThumb,
    ColorWheelTrack,
} from "@fragiola/primitives-angular/color-wheel";
import { styles } from "./styles.ts";

const INITIAL: Color = {
    space: "hsl",
    hue: 210,
    saturation: 80,
    lightness: 50,
    alpha: 1,
};

// An HSL editor: one color value shared by four controls (spec/color.md). The wheel picks the hue,
// the area its saturation and lightness, the slider its opacity, and the field reads and writes
// it as hex (Enter or leaving the field commits a typed color; an emptied field keeps the color).
// Each control reports the color in its own space; the swatch shows it.
@Component({
    selector: "example-color-editor",
    imports: [
        ColorWheelRoot,
        ColorWheelTrack,
        ColorWheelThumb,
        ColorAreaRoot,
        ColorAreaThumb,
        ColorAreaInput,
        ColorSliderRoot,
        ColorSliderLabel,
        ColorSliderTrack,
        ColorSliderThumb,
        ColorSliderOutput,
        ColorFieldRoot,
        ColorFieldInput,
    ],
    template: `
        <div [class]="styles.stack">
            <div [class]="styles.row">
                <div colorWheelRoot [(value)]="color" colorSpace="hsl" [outerRadius]="80" [innerRadius]="60" locale="en-US" [class]="styles.wheel.root">
                    <div colorWheelTrack [class]="styles.wheel.track"></div>
                    <div colorWheelThumb aria-label="Hue" [class]="styles.wheel.thumb"></div>
                </div>
                <div colorAreaRoot [(value)]="color" colorSpace="hsl" xChannel="saturation" yChannel="lightness" locale="en-US" aria-label="Saturation and lightness" [class]="styles.area.root">
                    <div colorAreaThumb [class]="styles.area.thumb"><input colorAreaInput axis="x" aria-label="Saturation" /><input colorAreaInput axis="y" aria-label="Lightness" /></div>
                </div>
            </div>
            <div colorSliderRoot [(value)]="color" channel="alpha" locale="en-US" [class]="styles.slider.root">
                <div colorSliderLabel [class]="styles.slider.label">Opacity</div>
                <div colorSliderTrack [class]="styles.slider.track"><div colorSliderThumb [class]="styles.slider.thumb"></div></div>
                <output colorSliderOutput [class]="styles.slider.output"></output>
            </div>
            <div [class]="styles.fieldRow">
                <label for="color-hex" [class]="styles.label">Hex</label>
                <div colorFieldRoot [id]="'color-hex'" [value]="color()" (valueChange)="setFromField($event)" [class]="styles.field.root"><input colorFieldInput [class]="styles.field.input" /></div>
                <div [class]="styles.swatch" [style.--swatch]="css()"></div>
                <output [class]="styles.value">{{ css() }}</output>
            </div>
        </div>
    `,
})
export default class ColorEditor {
    protected readonly styles = styles;
    protected readonly color = signal<Color>(INITIAL);
    protected readonly css = computed(() => formatColor(this.color(), "css"));

    protected setFromField(next: Color | null): void {
        if (next !== null) {
            this.color.set(next);
        }
    }
}
