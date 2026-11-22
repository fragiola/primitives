import { computed, Directive, inject } from "@angular/core";
import { ProgressRoot, statusAttributes } from "./progress-root.directive.ts";

/**
 * The filled part, from the inline start (spec/progress.md): `<div progressIndicator>` inside the
 * Track. Its structural style sets its inline size, and `--progress-indicator-size`; none while
 * indeterminate.
 */
@Directive({
    selector: "[progressIndicator]",
    exportAs: "progressIndicator",
    host: {
        "data-primitives-part": "progress-indicator",
        "[style.inset-inline-start]": "size() === null ? null : '0'",
        "[style.inline-size]": "size()",
        "[style.--progress-indicator-size]": "size()",
        "[attr.data-indeterminate]": "data().indeterminate",
        "[attr.data-progressing]": "data().progressing",
        "[attr.data-complete]": "data().complete",
    },
})
export class ProgressIndicator {
    private readonly root = inject(ProgressRoot);
    readonly state = this.root.state;
    protected readonly data = computed(() =>
        statusAttributes(this.state().status),
    );
    protected readonly size = computed(() => {
        const percent = this.root.percent();
        return percent === null ? null : `${percent}%`;
    });
}
