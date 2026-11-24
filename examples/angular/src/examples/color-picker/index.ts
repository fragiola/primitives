import { Component, computed, signal } from "@angular/core";
import {
    type Color,
    type ColorChannel,
    formatColor,
} from "@fragiola/primitives/color";
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
    ColorPickerEyeDropperTrigger,
    type ColorPickerFormat,
    ColorPickerFormatSelect,
    ColorPickerRoot,
} from "@fragiola/primitives-angular/color-picker";
import {
    ColorPickerPopoverPopup,
    ColorPickerPopoverPortal,
    ColorPickerPopoverPositioner,
    ColorPickerPopoverRoot,
    ColorPickerPopoverTrigger,
} from "@fragiola/primitives-angular/color-picker-popover";
import {
    ColorSliderRoot,
    ColorSliderThumb,
    ColorSliderTrack,
} from "@fragiola/primitives-angular/color-slider";
import { ColorSwatch } from "@fragiola/primitives-angular/color-swatch";
import {
    ColorSwatchPickerItem,
    ColorSwatchPickerRoot,
} from "@fragiola/primitives-angular/color-swatch-picker";
import { styles } from "./styles.ts";

const VIOLET: Color = {
    space: "rgb",
    red: 124,
    green: 58,
    blue: 237,
    alpha: 1,
};

const PRESETS = [
    { name: "Violet", color: "#7c3aed" },
    { name: "Blue", color: "#2563eb" },
    { name: "Teal", color: "#0d9488" },
    { name: "Green", color: "#16a34a" },
    { name: "Amber", color: "#d97706" },
    { name: "Red", color: "#dc2626" },
    { name: "Pink", color: "#db2777" },
    { name: "Slate", color: "#475569" },
];

/** The channel fields of each format, with their names (the app's: spec/color.md, "Channels"). */
const CHANNELS: Record<
    Exclude<ColorPickerFormat, "hex">,
    readonly [ColorChannel, string][]
> = {
    rgb: [
        ["red", "Red"],
        ["green", "Green"],
        ["blue", "Blue"],
    ],
    hsl: [
        ["hue", "Hue"],
        ["saturation", "Saturation"],
        ["lightness", "Lightness"],
    ],
    hsb: [
        ["hue", "Hue"],
        ["saturation", "Saturation"],
        ["brightness", "Brightness"],
    ],
};

// A theme color picker (spec/color-picker.md): the picker holds one color, every control inside
// its popup is bound to it (none is given a value of its own), and the format select chooses which
// fields edit it. The trigger shows the color; the preview uses the picker's CSS variable.
@Component({
    selector: "example-color-picker",
    imports: [
        ColorPickerRoot,
        ColorPickerFormatSelect,
        ColorPickerEyeDropperTrigger,
        ColorPickerPopoverRoot,
        ColorPickerPopoverTrigger,
        ColorPickerPopoverPortal,
        ColorPickerPopoverPositioner,
        ColorPickerPopoverPopup,
        ColorAreaRoot,
        ColorAreaThumb,
        ColorAreaInput,
        ColorSliderRoot,
        ColorSliderTrack,
        ColorSliderThumb,
        ColorFieldRoot,
        ColorFieldInput,
        ColorSwatch,
        ColorSwatchPickerRoot,
        ColorSwatchPickerItem,
    ],
    template: `
        <div colorPickerRoot [(value)]="color" [(format)]="format" [class]="styles.picker.root">
            <div [class]="styles.row">
                <ng-container colorPickerPopoverRoot>
                    <button colorPickerPopoverTrigger [class]="styles.popover.trigger">
                        <div colorSwatch aria-hidden="true" [class]="styles.swatch.root"></div>
                        <span [class]="styles.label">Theme color</span>
                        <span [class]="styles.hex">{{ hex() }}</span>
                    </button>
                    <ng-container *colorPickerPopoverPortal>
                        <div colorPickerPopoverPositioner [sideOffset]="8" [class]="styles.popover.positioner">
                            <div colorPickerPopoverPopup aria-label="Theme color picker" [class]="styles.popover.popup">
                                <div [class]="styles.columns">
                                    <div [class]="styles.column">
                                        <div colorAreaRoot xChannel="saturation" yChannel="brightness" [class]="styles.area.root">
                                            <div colorAreaThumb [class]="styles.area.thumb"><input colorAreaInput axis="x" aria-label="Saturation" /><input colorAreaInput axis="y" aria-label="Brightness" /></div>
                                        </div>
                                        <div colorSliderRoot channel="hue" [class]="styles.slider.root">
                                            <div colorSliderTrack [class]="styles.slider.track"><div colorSliderThumb aria-label="Hue" [class]="styles.slider.thumb"></div></div>
                                        </div>
                                        <div colorSliderRoot channel="alpha" [class]="styles.slider.root">
                                            <div colorSliderTrack [class]="styles.slider.track"><div colorSliderThumb aria-label="Opacity" [class]="styles.slider.thumb"></div></div>
                                        </div>
                                    </div>
                                    <div [class]="styles.column">
                                        <div [class]="styles.row">
                                            <select colorPickerFormatSelect aria-label="Format" [class]="styles.formatSelect"><option value="hex">Hex</option><option value="rgb">RGB</option><option value="hsl">HSL</option><option value="hsb">HSB</option></select>
                                            @if (channels(); as fields) {
                                                <div [class]="styles.channels">
                                                    @for (entry of fields; track entry[0]) {
                                                        <div colorFieldRoot [channel]="entry[0]" [colorSpace]="space()" [class]="styles.field.root"><input colorFieldInput [attr.aria-label]="entry[1]" [class]="styles.channelInput" /></div>
                                                    }
                                                </div>
                                            } @else {
                                                <div colorFieldRoot [class]="styles.field.root"><input colorFieldInput aria-label="Hex" [class]="styles.field.input" /></div>
                                            }
                                        </div>
                                        <div colorSwatchPickerRoot aria-label="Presets" [class]="styles.swatches.root">
                                            @for (preset of presets; track preset.color) {
                                                <div colorSwatchPickerItem [value]="preset.color" [class]="styles.swatches.item"><div colorSwatch [color]="preset.color" [aria-label]="preset.name" [class]="styles.swatch.root"></div></div>
                                            }
                                        </div>
                                        <button *colorPickerEyeDropperTrigger [class]="styles.eyeDropper">Pick from the screen</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
            </div>
            <div [class]="styles.preview">Preview</div>
        </div>
    `,
})
export default class ThemeColorPicker {
    protected readonly styles = styles;
    protected readonly presets = PRESETS;
    protected readonly color = signal<Color>(VIOLET);
    protected readonly format = signal<ColorPickerFormat>("hex");
    protected readonly hex = computed(() => formatColor(this.color(), "hex"));
    /** The channel fields of the format (none for `hex`: one hex field). */
    protected readonly channels = computed(() => {
        const format = this.format();
        return format === "hex" ? null : CHANNELS[format];
    });
    /** The space the channel fields edit in: the format's. */
    protected readonly space = computed(() => {
        const format = this.format();
        return format === "hex" ? undefined : format;
    });
}
