import { Component, signal, ViewEncapsulation } from "@angular/core";
import { type Color, formatColor } from "@fragiola/primitives/color";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import {
    COLOR_PICKER_PARTS,
    COLOR_PICKER_STYLES,
} from "./color-picker-parts.ts";

const PRESETS = [
    { name: "Red", color: "#ff0000" },
    { name: "Green", color: "#00ff00" },
    { name: "Blue", color: "#0000ff" },
];

/** spec/color-picker.md, `/color-picker/basic`: one color shared by the controls inside it. */
@Component({
    selector: "[scenario-color-picker-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [COLOR_PICKER_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <div colorPickerRoot aria-label="Theme color" defaultValue="hsb(210, 50%, 60%)" [name]="'color'" (valueChange)="change($event)" (valueCommit)="committed.set(hex($event))" (formatChange)="format.set($event)" [class]="styles.picker.root">
                <div colorAreaRoot xChannel="saturation" yChannel="brightness" locale="en-US" [class]="styles.area.root">
                    <div colorAreaThumb [class]="styles.area.thumb"><input colorAreaInput axis="x" aria-label="Saturation" [class]="styles.area.input" /><input colorAreaInput axis="y" aria-label="Brightness" [class]="styles.area.input" /></div>
                </div>
                <div colorSliderRoot channel="hue" locale="en-US" [class]="styles.slider.root">
                    <div colorSliderTrack [class]="styles.slider.track"><div colorSliderThumb aria-label="Hue" [class]="styles.slider.thumb"></div></div>
                </div>
                <div colorSliderRoot channel="alpha" locale="en-US" [class]="styles.slider.root">
                    <div colorSliderTrack [class]="styles.slider.track"><div colorSliderThumb aria-label="Opacity" [class]="styles.slider.thumb"></div></div>
                </div>
                <div colorFieldRoot [class]="styles.field.root"><input colorFieldInput aria-label="Hex" [class]="styles.field.input" /></div>
                <div colorSwatch aria-label="Current color" [class]="styles.swatch.root"></div>
                <div colorSwatchPickerRoot aria-label="Presets" [class]="styles.swatchPicker.root">
                    @for (swatch of presets; track swatch.color) {
                        <div colorSwatchPickerItem [value]="swatch.color" [class]="styles.swatchPicker.item"><div colorSwatch [color]="swatch.color" [aria-label]="swatch.name" [class]="styles.swatch.root"></div></div>
                    }
                </div>
                <select colorPickerFormatSelect aria-label="Format" [class]="styles.picker['format-select']"><option value="hex">Hex</option><option value="rgb">RGB</option><option value="hsl">HSL</option><option value="hsb">HSB</option></select>
                <button *colorPickerEyeDropperTrigger [class]="styles.picker['eye-dropper-trigger']">Pick a color</button>
                <div colorSliderRoot channel="hue" defaultValue="hsl(0, 100%, 50%)" locale="en-US" (valueChange)="own.set(css($event))" [class]="styles.slider.root">
                    <div colorSliderTrack [class]="styles.slider.track"><div colorSliderThumb aria-label="Own hue" [class]="styles.slider.thumb"></div></div>
                </div>
            </div>
            <div class="flex gap-2"><button type="submit">Submit</button><button type="reset">Reset</button></div>
        </form>
        <pre fixtureOutput [values]="{ value: value(), space: space(), committed: committed(), format: format(), own: own(), form: form() }"></pre>
    `,
})
export class ColorPickerBasic {
    protected readonly styles = COLOR_PICKER_STYLES;
    protected readonly presets = PRESETS;
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly space = signal<string | undefined>(undefined);
    protected readonly committed = signal<string | undefined>(undefined);
    protected readonly format = signal<string | undefined>(undefined);
    protected readonly own = signal<string | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);
    protected readonly hex = (color: Color) => formatColor(color, "hex");
    protected readonly css = (color: Color) => formatColor(color);

    protected change(next: Color): void {
        this.value.set(formatColor(next, "hex"));
        this.space.set(next.space);
    }

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
