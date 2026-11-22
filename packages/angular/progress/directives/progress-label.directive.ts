import { computed, Directive, inject, input } from "@angular/core";
import { labelId } from "@fragiola/primitives-angular/internal";
import { ProgressRoot, statusAttributes } from "./progress-root.directive.ts";

/** Names the progress bar (`aria-labelledby`, spec/progress.md): `<span progressLabel>Upload</span>`. */
@Directive({
    selector: "[progressLabel]",
    exportAs: "progressLabel",
    host: {
        "data-primitives-part": "progress-label",
        "[attr.id]": "resolvedId()",
        "[attr.data-indeterminate]": "data().indeterminate",
        "[attr.data-progressing]": "data().progressing",
        "[attr.data-complete]": "data().complete",
    },
})
export class ProgressLabel {
    readonly id = input<string | undefined>(undefined);
    private readonly root = inject(ProgressRoot);
    readonly state = this.root.state;
    protected readonly data = computed(() =>
        statusAttributes(this.state().status),
    );
    protected readonly resolvedId = labelId(
        this.id,
        this.root.labelId,
        "primitives-progress-label",
    );
}
