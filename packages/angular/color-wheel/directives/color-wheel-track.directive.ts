import { computed, Directive, inject } from "@angular/core";
import { colorWheelGradient } from "@fragiola/primitives/color";
import { dataValues } from "@fragiola/primitives-angular/internal";
import { ColorWheelRoot } from "./color-wheel-root.directive.ts";

const GRADIENT = colorWheelGradient();

/** The ring: its conic gradient, for the recipe to draw (spec/color-wheel.md): `<div colorWheelTrack>`. */
@Directive({
    selector: "[colorWheelTrack]",
    exportAs: "colorWheelTrack",
    host: {
        "data-primitives-part": "color-wheel-track",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-dragging]": "data().dragging",
        // structural: the Root's box, and the gradient a recipe draws
        "[style.position]": "'absolute'",
        "[style.inset]": "'0'",
        "[style.--color-wheel-track-background]": "gradient",
    },
})
export class ColorWheelTrack {
    readonly state = inject(ColorWheelRoot).state;
    protected readonly gradient = GRADIENT;
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            disabled: state.disabled,
            dragging: state.dragging,
        });
    });
}
