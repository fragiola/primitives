import { computed, Directive, inject } from "@angular/core";
import { MeterRoot } from "./meter-root.directive.ts";

/**
 * The filled part, from the inline start (spec/meter.md): `<div meterIndicator>` inside the Track.
 * Its structural style sets its inline size, and `--meter-indicator-size`.
 */
@Directive({
    selector: "[meterIndicator]",
    exportAs: "meterIndicator",
    host: {
        "data-primitives-part": "meter-indicator",
        "[style.inset-inline-start]": "'0'",
        "[style.inline-size]": "size()",
        "[style.--meter-indicator-size]": "size()",
    },
})
export class MeterIndicator {
    private readonly root = inject(MeterRoot);
    readonly state = this.root.state;
    protected readonly size = computed(() => `${this.root.percent()}%`);
}
