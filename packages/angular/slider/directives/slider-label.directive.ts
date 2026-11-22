import { computed, Directive, inject, input } from "@angular/core";
import { dataValues, labelId } from "@fragiola/primitives-angular/internal";
import { SliderRoot } from "./slider-root.directive.ts";

/**
 * Names the slider and its Thumbs with no name of their own (`aria-labelledby`; spec/slider.md):
 * `<div sliderLabel>Volume</div>`. A press on it focuses the first thumb (a `div` has no `for`).
 */
@Directive({
    selector: "[sliderLabel]",
    exportAs: "sliderLabel",
    host: {
        "data-primitives-part": "slider-label",
        "[attr.id]": "resolvedId()",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-disabled]": "data().disabled",
        "(click)": "onClick()",
    },
})
export class SliderLabel {
    readonly id = input<string | undefined>(undefined);
    private readonly root = inject(SliderRoot);
    readonly state = this.root.state;
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            orientation: state.orientation,
            disabled: state.disabled,
        });
    });
    protected readonly resolvedId = labelId(
        this.id,
        this.root.labelId,
        "primitives-slider-label",
    );

    protected onClick(): void {
        this.root.thumbs()[0]?.focus();
    }
}
