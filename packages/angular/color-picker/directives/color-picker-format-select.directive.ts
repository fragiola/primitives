import {
    afterRenderEffect,
    computed,
    Directive,
    inject,
    untracked,
} from "@angular/core";
import { dataValues, injectHost } from "@fragiola/primitives-angular/internal";
import {
    COLOR_PICKER_FORMATS,
    type ColorPickerFormat,
    ColorPickerRoot,
    type ColorPickerState,
} from "./color-picker-root.directive.ts";

/**
 * A native `select` of the picker's format (spec/color-picker.md, "The format"):
 * `<select colorPickerFormatSelect aria-label="Format">` holding the app's `<option value="hex">`s.
 */
@Directive({
    selector: "select[colorPickerFormatSelect]",
    exportAs: "colorPickerFormatSelect",
    host: {
        "data-primitives-part": "color-picker-format-select",
        "[disabled]": "state().disabled",
        "[attr.data-format]": "data().format",
        "[attr.data-disabled]": "data().disabled",
        "(change)": "onChange($event)",
    },
})
export class ColorPickerFormatSelect {
    protected readonly root = inject(ColorPickerRoot);
    readonly state = computed<ColorPickerState>(() => this.root.state());
    protected readonly data = computed(() =>
        dataValues({
            format: this.state().format,
            disabled: this.state().disabled,
        }),
    );

    constructor() {
        const select = injectHost() as HTMLSelectElement;
        // the selected option is the select's own state, set after the render (a server marks no
        // option); its default too, so a form reset shows the picker's format again
        afterRenderEffect(() => {
            const format = this.state().format;
            untracked(() => {
                for (const option of select.options) {
                    option.defaultSelected = option.value === format;
                }
                select.value = format;
            });
        });
    }

    protected onChange(event: Event): void {
        const next = (event.target as HTMLSelectElement)
            .value as ColorPickerFormat;
        if (COLOR_PICKER_FORMATS.includes(next)) {
            this.root.setFormat(next, event);
        }
        // a refused change shows the format again
        (event.target as HTMLSelectElement).value = untracked(
            this.root.currentFormat,
        );
    }
}
