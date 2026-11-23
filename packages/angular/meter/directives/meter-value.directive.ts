import { afterRenderEffect, computed, Directive, inject } from "@angular/core";
import { injectHost } from "@fragiola/primitives-angular/internal";
import { MeterRoot } from "./meter-root.directive.ts";

/**
 * Shows the formatted value (spec/meter.md): `<span meterValue></span>` shows the Root's
 * formatted value; content of its own replaces it, reading `formattedValue()` and `value()`
 * through `exportAs` (`<span meterValue #shown="meterValue">{{ shown.value() }} GB</span>`).
 */
@Directive({
    selector: "[meterValue]",
    exportAs: "meterValue",
    host: { "data-primitives-part": "meter-value" },
})
export class MeterValue {
    private readonly root = inject(MeterRoot);
    readonly state = this.root.state;
    /** The value as the Root's `format` writes it. */
    readonly formattedValue = this.root.formattedValue;
    /** The clamped value. */
    readonly value = computed(() => this.state().value);

    constructor() {
        const host = injectHost();
        // the default content, in the browser only (a server renders none, so hydration finds no
        // node its template does not have): content of the consumer's own keeps its place, as
        // Progress's Value
        let own: boolean | null = null;
        afterRenderEffect(() => {
            const text = this.formattedValue();
            own ??= host.childNodes.length > 0;
            if (!own && host.textContent !== text) {
                host.textContent = text;
            }
        });
    }
}
