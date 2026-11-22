import { computed, Directive, inject } from "@angular/core";
import { SwitchRoot, switchAttributes } from "./switch-root.directive.ts";

/**
 * The moving part, always rendered (spec/switch.md): `<span switchThumb></span>` inside the
 * `[switchRoot]`; the recipe places it from `data-checked`.
 */
@Directive({
    selector: "[switchThumb]",
    exportAs: "switchThumb",
    host: {
        "data-primitives-part": "switch-thumb",
        "[attr.data-checked]": "data().checked",
        "[attr.data-unchecked]": "data().unchecked",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-readonly]": "data().readonly",
        "[attr.data-required]": "data().required",
    },
})
export class SwitchThumb {
    private readonly root = inject(SwitchRoot);
    readonly state = this.root.state;
    protected readonly data = computed(() => switchAttributes(this.state()));
}
