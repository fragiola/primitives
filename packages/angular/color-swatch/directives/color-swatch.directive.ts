import { computed, Directive, input } from "@angular/core";
import {
    type Color,
    formatColor,
    parseColor,
} from "@fragiola/primitives/color";
import { injectColorPickerBinding } from "@fragiola/primitives-angular/internal";

/** What a ColorSwatch renders with (spec/color-swatch.md). */
export interface ColorSwatchState {
    /** The color it shows. */
    color: Color;
}

const TRANSPARENT: Color = {
    space: "rgb",
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0,
};

/**
 * A preview of a color (spec/color-swatch.md): `<div colorSwatch color="#336699"
 * aria-label="Ocean">` (or `[aria-label]="name"`), an `img` the app names (else named by the color's CSS text), its color
 * and its opaque color as CSS variables a recipe draws over a checkerboard.
 */
@Directive({
    selector: "[colorSwatch]",
    exportAs: "colorSwatch",
    host: {
        role: "img",
        "data-primitives-part": "color-swatch-root",
        "[attr.aria-label]": "label()",
        "[attr.aria-labelledby]": "ariaLabelledby() ?? null",
        "[style.--color-swatch-color]": "css()",
        "[style.--color-swatch-color-opaque]": "opaque()",
    },
})
export class ColorSwatch {
    /** The color it shows (default: an enclosing ColorPicker's, else transparent black). */
    readonly color = input<Color | string | undefined>(undefined);

    /** Its name (default: the color's CSS text, unless `aria-labelledby` names it). */
    readonly ariaLabel = input<string | undefined>(undefined, {
        alias: "aria-label",
    });
    readonly ariaLabelledby = input<string | undefined>(undefined, {
        alias: "aria-labelledby",
    });

    private readonly picker = injectColorPickerBinding();
    readonly state = computed<ColorSwatchState>(() => {
        const color = this.color();
        return {
            color:
                color === undefined
                    ? (this.picker?.value() ?? TRANSPARENT)
                    : (parseColor(color) ?? TRANSPARENT),
        };
    });
    protected readonly css = computed(() =>
        formatColor(this.state().color, "css"),
    );
    protected readonly opaque = computed(() =>
        formatColor({ ...this.state().color, alpha: 1 }, "css"),
    );
    protected readonly label = computed(
        () =>
            this.ariaLabel() ??
            (this.ariaLabelledby() === undefined ? this.css() : null),
    );
}
