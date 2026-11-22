import { computed, Directive, inject } from "@angular/core";
import { dataValues } from "@fragiola/primitives-angular/internal";
import { SliderRoot } from "./slider-root.directive.ts";

/** The rail (spec/slider.md): `<div sliderTrack>`. */
@Directive({
    selector: "[sliderTrack]",
    exportAs: "sliderTrack",
    host: {
        "data-primitives-part": "slider-track",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-dragging]": "data().dragging",
    },
})
export class SliderTrack {
    readonly state = inject(SliderRoot).state;
    protected readonly data = computed(() => dataValues(this.state()));
}
