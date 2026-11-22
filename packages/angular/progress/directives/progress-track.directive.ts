import { computed, Directive, inject } from "@angular/core";
import { ProgressRoot, statusAttributes } from "./progress-root.directive.ts";

/** The rail the Indicator fills (spec/progress.md): `<div progressTrack>`. */
@Directive({
    selector: "[progressTrack]",
    exportAs: "progressTrack",
    host: {
        "data-primitives-part": "progress-track",
        "[attr.data-indeterminate]": "data().indeterminate",
        "[attr.data-progressing]": "data().progressing",
        "[attr.data-complete]": "data().complete",
    },
})
export class ProgressTrack {
    private readonly root = inject(ProgressRoot);
    readonly state = this.root.state;
    protected readonly data = computed(() =>
        statusAttributes(this.state().status),
    );
}
