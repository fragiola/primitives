import { computed, Directive, input, numberAttribute } from "@angular/core";

/** What an AspectRatio renders with (spec/aspect-ratio.md). */
export interface AspectRatioState {
    /** The width over the height. */
    ratio: number;
}

/**
 * A box that keeps its content at a ratio (spec/aspect-ratio.md): `<div aspectRatio
 * [ratio]="16 / 9">`. A structural `aspect-ratio`, and nothing else.
 */
@Directive({
    selector: "[aspectRatio]",
    exportAs: "aspectRatio",
    host: {
        "data-primitives-part": "aspect-ratio-root",
        "[style.aspect-ratio]": "value()",
        "[style.min-height]": "'0'",
    },
})
export class AspectRatio {
    /** The width over the height (default `1`; not a positive finite number: `1`). */
    readonly ratio = input(1, { transform: numberAttribute });
    readonly state = computed<AspectRatioState>(() => {
        const ratio = this.ratio();
        return { ratio: Number.isFinite(ratio) && ratio > 0 ? ratio : 1 };
    });
    protected readonly value = computed(() => String(this.state().ratio));
}
