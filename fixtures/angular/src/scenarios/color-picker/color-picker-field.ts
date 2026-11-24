import { Component, signal, ViewEncapsulation } from "@angular/core";
import { type Color, formatColor } from "@fragiola/primitives/color";
import { field } from "examples-shared/recipes/field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import {
    COLOR_PICKER_PARTS,
    COLOR_PICKER_STYLES,
} from "./color-picker-parts.ts";

/** spec/color-picker.md, `/color-picker/field` */
@Component({
    selector: "[scenario-color-picker-field]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, COLOR_PICKER_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <div fieldRoot [name]="'brand'" [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Brand color</label>
                <div colorPickerRoot defaultValue="#336699" (valueChange)="value.set(hex($event))" [class]="styles.picker.root">
                    <div colorSliderRoot channel="hue" [name]="'hue'" locale="en-US" [class]="styles.slider.root">
                        <div colorSliderTrack [class]="styles.slider.track"><div colorSliderThumb aria-label="Hue" [class]="styles.slider.thumb"></div></div>
                    </div>
                    <div colorSwatch aria-label="Brand color preview" [class]="styles.swatch.root"></div>
                    <ng-container colorPickerPopoverRoot>
                        <button colorPickerPopoverTrigger [class]="styles.popover.trigger">More options</button>
                        <ng-container *colorPickerPopoverPortal>
                            <div colorPickerPopoverPositioner [sideOffset]="8" [class]="styles.popover.positioner">
                                <div colorPickerPopoverPopup aria-label="More" [class]="styles.popover.popup">
                                    <div colorFieldRoot [class]="styles.field.root"><input colorFieldInput aria-label="Hex" [class]="styles.field.input" /></div>
                                </div>
                            </div>
                        </ng-container>
                    </ng-container>
                </div>
                <p fieldDescription [class]="fieldStyles.description">Used for links.</p>
            </div>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ value: value(), form: form() }"></pre>
    `,
})
export class ColorPickerField {
    protected readonly styles = COLOR_PICKER_STYLES;
    protected readonly fieldStyles = field;
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);
    protected readonly hex = (color: Color) => formatColor(color, "hex");

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
