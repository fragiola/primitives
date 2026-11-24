import { afterRenderEffect, computed, Directive, inject } from "@angular/core";
import { dataValues, injectHost } from "@fragiola/primitives-angular/internal";
import { ColorSliderRoot } from "./color-slider-root.directive.ts";

/**
 * Shows the channel's value as text (`Intl`: `"120°"`, `"50%"`; spec/color-slider.md), on the
 * consumer's own `<output>`: `<output colorSliderOutput></output>` shows it; content of its own
 * replaces it, reading `valueText()` through `exportAs` (`#output="colorSliderOutput"`).
 */
@Directive({
    selector: "output[colorSliderOutput]",
    exportAs: "colorSliderOutput",
    host: {
        "data-primitives-part": "color-slider-output",
        "aria-live": "off",
        "[attr.for]": "htmlFor()",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-channel]": "data().channel",
        "[attr.data-disabled]": "data().disabled",
    },
})
export class ColorSliderOutput {
    private readonly root = inject(ColorSliderRoot);
    readonly state = this.root.state;
    /** The channel's text, as the default content shows it. */
    readonly valueText = this.root.valueText;
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            orientation: state.orientation,
            channel: state.channel,
            disabled: state.disabled,
        });
    });
    /** The Thumb's id. */
    protected readonly htmlFor = computed(() => this.root.thumbId() || null);

    constructor() {
        const host = injectHost();
        // the default content, in the browser only (a server renders none, so hydration finds no
        // node its template does not have): content of the consumer's own keeps its place
        let own: boolean | null = null;
        afterRenderEffect(() => {
            const text = this.valueText();
            own ??= host.childNodes.length > 0;
            if (!own && host.textContent !== text) {
                host.textContent = text;
            }
        });
    }
}
