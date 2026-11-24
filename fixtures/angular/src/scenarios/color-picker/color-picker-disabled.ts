import { Component, ViewEncapsulation } from "@angular/core";
import {
    COLOR_PICKER_PARTS,
    COLOR_PICKER_STYLES,
} from "./color-picker-parts.ts";

const PRESETS = [
    { name: "Red", color: "#ff0000" },
    { name: "Green", color: "#00ff00" },
];

/** spec/color-picker.md, `/color-picker/disabled` */
@Component({
    selector: "[scenario-color-picker-disabled]",
    encapsulation: ViewEncapsulation.None,
    imports: [COLOR_PICKER_PARTS],
    template: `
        <div colorPickerRoot disabled defaultValue="#336699" [class]="styles.picker.root">
            <div colorSliderRoot channel="hue" locale="en-US" [class]="styles.slider.root">
                <div colorSliderTrack [class]="styles.slider.track"><div colorSliderThumb aria-label="Hue" [class]="styles.slider.thumb"></div></div>
            </div>
            <div colorSwatchPickerRoot aria-label="Presets" [class]="styles.swatchPicker.root">
                @for (swatch of presets; track swatch.color) {
                    <div colorSwatchPickerItem [value]="swatch.color" [class]="styles.swatchPicker.item"><div colorSwatch [color]="swatch.color" [aria-label]="swatch.name" [class]="styles.swatch.root"></div></div>
                }
            </div>
            <select colorPickerFormatSelect aria-label="Format" [class]="styles.picker['format-select']"><option value="hex">Hex</option><option value="rgb">RGB</option></select>
            <button *colorPickerEyeDropperTrigger [class]="styles.picker['eye-dropper-trigger']">Pick a color</button>
            <ng-container colorPickerPopoverRoot>
                <button colorPickerPopoverTrigger aria-label="Open picker" [class]="styles.popover.trigger"><div colorSwatch [class]="styles.swatch.root"></div></button>
                <ng-container *colorPickerPopoverPortal>
                    <div colorPickerPopoverPositioner [class]="styles.popover.positioner">
                        <div colorPickerPopoverPopup aria-label="Picker" [class]="styles.popover.popup">
                            <div colorFieldRoot [class]="styles.field.root"><input colorFieldInput aria-label="Hex" [class]="styles.field.input" /></div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
        </div>
    `,
})
export class ColorPickerDisabled {
    protected readonly styles = COLOR_PICKER_STYLES;
    protected readonly presets = PRESETS;
}
