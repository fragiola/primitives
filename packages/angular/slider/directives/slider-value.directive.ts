import { afterRenderEffect, computed, Directive, inject } from "@angular/core";
import { dataValues, injectHost } from "@fragiola/primitives-angular/internal";
import { SliderRoot } from "./slider-root.directive.ts";

/** Base UI's separator between the values of several thumbs: punctuation, not copy. */
const SEPARATOR = " – ";

/**
 * Shows the slider's values (spec/slider.md), on the consumer's own `<output>`:
 * `<output sliderValue></output>` shows the formatted values (with the Root's `format`, else the
 * numbers), joined with `" – "`; content of its own replaces them, reading `formattedValues()` and
 * `values()` through `exportAs` (`<output sliderValue #value="sliderValue">`).
 */
@Directive({
    selector: "[sliderValue]",
    exportAs: "sliderValue",
    host: {
        "data-primitives-part": "slider-value",
        "aria-live": "off",
        "[attr.for]": "htmlFor()",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-disabled]": "data().disabled",
    },
})
export class SliderValue {
    private readonly root = inject(SliderRoot);
    readonly state = this.root.state;
    /** The values, formatted as the default content shows them. */
    readonly formattedValues = this.root.formattedValues;
    readonly values = this.root.values;
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            orientation: state.orientation,
            disabled: state.disabled,
        });
    });
    /** The thumbs' ids, in value order. */
    protected readonly htmlFor = computed(() => {
        const ids = this.root.thumbIds();
        return (
            Object.keys(ids)
                .map(Number)
                .sort((a, b) => a - b)
                .map((index) => ids[index])
                .join(" ") || null
        );
    });

    constructor() {
        const host = injectHost();
        // the default content, in the browser only (a server renders none, so hydration finds no
        // node its template does not have): content of the consumer's own keeps its place
        let own: boolean | null = null;
        afterRenderEffect(() => {
            const text = this.formattedValues().join(SEPARATOR);
            own ??= host.childNodes.length > 0;
            if (!own && host.textContent !== text) {
                host.textContent = text;
            }
        });
    }
}
