import { Component, signal, ViewEncapsulation } from "@angular/core";
import { type Color, formatColor } from "@fragiola/primitives/color";
import { ColorSwatch } from "@fragiola/primitives-angular/color-swatch";
import {
    ColorSwatchPickerItem,
    ColorSwatchPickerRoot,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/color-swatch-picker";
import { colorSwatch } from "examples-shared/recipes/color-swatch";
import { colorSwatchPicker } from "examples-shared/recipes/color-swatch-picker";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { SWATCHES } from "./swatches.ts";

/** spec/color-swatch-picker.md, `/color-swatch-picker/basic`; also `/rtl` (the page sets `dir`). */
@Component({
    selector: "[scenario-color-swatch-picker-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        ColorSwatchPickerRoot,
        ColorSwatchPickerItem,
        ColorSwatch,
        Output,
    ],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <h2 id="palette" class="text-sm font-semibold">Palette</h2>
            <div colorSwatchPickerRoot aria-labelledby="palette" [name]="'color'" (valueChangeDetails)="change($event)" [class]="styles.root">
                @for (swatch of swatches; track swatch.color) {
                    <div colorSwatchPickerItem [value]="swatch.color" [disabled]="swatch.disabled ?? false" [class]="styles.item"><div colorSwatch [color]="swatch.color" [aria-label]="swatch.name" [class]="swatchStyles.root"></div></div>
                }
            </div>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ value: value(), reason: reason(), form: form() }"></pre>
    `,
})
export class ColorSwatchPickerBasic {
    protected readonly styles = colorSwatchPicker;
    protected readonly swatchStyles = colorSwatch;
    protected readonly swatches = SWATCHES;
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);

    protected change(event: ValueChangeEvent<Color | null>): void {
        this.value.set(
            event.value === null ? undefined : formatColor(event.value, "hex"),
        );
        this.reason.set(event.details.reason);
    }

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
