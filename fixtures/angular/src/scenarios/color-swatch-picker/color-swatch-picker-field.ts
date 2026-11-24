import { Component, signal, ViewEncapsulation } from "@angular/core";
import { type Color, formatColor } from "@fragiola/primitives/color";
import { ColorSwatch } from "@fragiola/primitives-angular/color-swatch";
import {
    ColorSwatchPickerItem,
    ColorSwatchPickerRoot,
} from "@fragiola/primitives-angular/color-swatch-picker";
import { colorSwatch } from "examples-shared/recipes/color-swatch";
import { colorSwatchPicker } from "examples-shared/recipes/color-swatch-picker";
import { field } from "examples-shared/recipes/field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { SWATCHES } from "./swatches.ts";

/** spec/color-swatch-picker.md, `/color-swatch-picker/field` */
@Component({
    selector: "[scenario-color-swatch-picker-field]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        FIELD_PARTS,
        ColorSwatchPickerRoot,
        ColorSwatchPickerItem,
        ColorSwatch,
        Output,
    ],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <div fieldRoot [name]="'accent'" [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Accent</label>
                <div colorSwatchPickerRoot defaultValue="#00ff00" (valueChange)="change($event)" [class]="styles.root">
                    @for (swatch of swatches; track swatch.color) {
                        <div colorSwatchPickerItem [value]="swatch.color" [disabled]="swatch.disabled ?? false" [class]="styles.item"><div colorSwatch [color]="swatch.color" [aria-label]="swatch.name" [class]="swatchStyles.root"></div></div>
                    }
                </div>
                <p fieldDescription [class]="fieldStyles.description">The links' color.</p>
            </div>
            <div class="flex gap-2"><button type="submit">Submit</button><button type="reset">Reset</button></div>
        </form>
        <pre fixtureOutput [values]="{ value: value(), form: form() }"></pre>
    `,
})
export class ColorSwatchPickerField {
    protected readonly styles = colorSwatchPicker;
    protected readonly swatchStyles = colorSwatch;
    protected readonly fieldStyles = field;
    protected readonly swatches = SWATCHES;
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);

    protected change(next: Color | null): void {
        this.value.set(next === null ? undefined : formatColor(next, "hex"));
    }

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
