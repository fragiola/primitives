import { Component, signal, ViewEncapsulation } from "@angular/core";
import { type Color, formatColor } from "@fragiola/primitives/color";
import type { OpenChangeEvent } from "@fragiola/primitives-angular/color-picker-popover";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import {
    COLOR_PICKER_PARTS,
    COLOR_PICKER_STYLES,
} from "./color-picker-parts.ts";

/** spec/color-picker.md, `/color-picker/popover`: the picker in its opt-in popup. */
@Component({
    selector: "[scenario-color-picker-popover]",
    encapsulation: ViewEncapsulation.None,
    imports: [COLOR_PICKER_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <div colorPickerRoot defaultValue="#336699" [name]="'accent'" (valueChange)="value.set(hex($event))" [class]="styles.picker.root">
                <ng-container colorPickerPopoverRoot (openChangeDetails)="openChange($event)">
                    <button colorPickerPopoverTrigger aria-label="Accent color" [class]="styles.popover.trigger"><div colorSwatch [class]="styles.swatch.root"></div></button>
                    <ng-container *colorPickerPopoverPortal>
                        <div colorPickerPopoverPositioner [sideOffset]="8" [class]="styles.popover.positioner">
                            <div colorPickerPopoverPopup aria-label="Accent color picker" [class]="styles.popover.popup">
                                <div colorAreaRoot xChannel="saturation" yChannel="brightness" locale="en-US" [class]="styles.area.root">
                                    <div colorAreaThumb [class]="styles.area.thumb"><input colorAreaInput axis="x" aria-label="Saturation" [class]="styles.area.input" /><input colorAreaInput axis="y" aria-label="Brightness" [class]="styles.area.input" /></div>
                                </div>
                                <div colorSliderRoot channel="hue" locale="en-US" [class]="styles.slider.root">
                                    <div colorSliderTrack [class]="styles.slider.track"><div colorSliderThumb aria-label="Hue" [class]="styles.slider.thumb"></div></div>
                                </div>
                                <div colorFieldRoot [class]="styles.field.root"><input colorFieldInput aria-label="Hex" [class]="styles.field.input" /></div>
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
            </div>
            <div class="flex gap-2"><button type="button">After</button><button type="submit">Submit</button></div>
        </form>
        <pre fixtureOutput [values]="{ value: value(), open: open(), reason: reason(), form: form() }"></pre>
    `,
})
export class ColorPickerPopoverScenario {
    protected readonly styles = COLOR_PICKER_STYLES;
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly open = signal<boolean | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);
    protected readonly hex = (color: Color) => formatColor(color, "hex");

    protected openChange(event: OpenChangeEvent): void {
        this.open.set(event.open);
        this.reason.set(event.details.reason);
    }

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
