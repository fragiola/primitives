import { computed, Directive, inject, input } from "@angular/core";
import { dataValues, labelId } from "@fragiola/primitives-angular/internal";
import { ColorSliderRoot } from "./color-slider-root.directive.ts";

/**
 * Names the slider and its Thumb while it has no name of its own (`aria-labelledby`;
 * spec/color-slider.md): `<div colorSliderLabel>Hue</div>`. A press on it focuses the Thumb (a
 * `div` has no `for`, Slider's Label).
 */
@Directive({
    selector: "[colorSliderLabel]",
    exportAs: "colorSliderLabel",
    host: {
        "data-primitives-part": "color-slider-label",
        "[attr.id]": "resolvedId()",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-channel]": "data().channel",
        "[attr.data-disabled]": "data().disabled",
        "(click)": "onClick()",
    },
})
export class ColorSliderLabel {
    readonly id = input<string | undefined>(undefined);
    private readonly root = inject(ColorSliderRoot);
    readonly state = this.root.state;
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            orientation: state.orientation,
            channel: state.channel,
            disabled: state.disabled,
        });
    });
    protected readonly resolvedId = labelId(
        this.id,
        this.root.labelId,
        "primitives-color-slider-label",
    );

    protected onClick(): void {
        if (!this.root.isDisabled()) {
            this.root.thumb()?.focus();
        }
    }
}
