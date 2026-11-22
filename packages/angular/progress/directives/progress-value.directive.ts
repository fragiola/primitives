import { afterRenderEffect, computed, Directive, inject } from "@angular/core";
import { injectHost } from "@fragiola/primitives-angular/internal";
import { ProgressRoot, statusAttributes } from "./progress-root.directive.ts";

/**
 * Shows the formatted value, empty while indeterminate (spec/progress.md):
 * `<span progressValue></span>` shows the Root's formatted value; content of its own replaces it,
 * reading `formattedValue()` and `value()` through `exportAs`
 * (`<span progressValue #shown="progressValue">{{ shown.value() }} files</span>`).
 */
@Directive({
    selector: "[progressValue]",
    exportAs: "progressValue",
    host: {
        "data-primitives-part": "progress-value",
        "[attr.data-indeterminate]": "data().indeterminate",
        "[attr.data-progressing]": "data().progressing",
        "[attr.data-complete]": "data().complete",
    },
})
export class ProgressValue {
    private readonly root = inject(ProgressRoot);
    readonly state = this.root.state;
    /** The value as the Root's `format` writes it; `""` when indeterminate. */
    readonly formattedValue = this.root.formattedValue;
    /** The clamped value, `null` when indeterminate. */
    readonly value = computed(() => this.state().value);
    protected readonly data = computed(() =>
        statusAttributes(this.state().status),
    );

    constructor() {
        const host = injectHost();
        // the default content, in the browser only (a server renders none, so hydration finds no
        // node its template does not have): content of the consumer's own keeps its place
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
