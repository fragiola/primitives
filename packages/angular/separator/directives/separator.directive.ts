import { booleanAttribute, computed, Directive, input } from "@angular/core";
import { dataValues } from "@fragiola/primitives-angular/internal";

export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorState {
    orientation: SeparatorOrientation;
    decorative: boolean;
}

/**
 * A divider between sections or groups (spec/separator.md, the ARIA separator, not focusable), on
 * the consumer's own element: `<div separator orientation="vertical">`. A `decorative` one is
 * hidden from assistive technologies (`role="none"`).
 */
@Directive({
    selector: "[separator]",
    exportAs: "separator",
    host: {
        "data-primitives-part": "separator-root",
        "[attr.role]": "state().decorative ? 'none' : 'separator'",
        "[attr.aria-orientation]":
            "state().decorative ? null : state().orientation",
        "[attr.data-orientation]": "data().orientation",
    },
})
export class Separator {
    readonly orientation = input<SeparatorOrientation>("horizontal");
    /** Hidden from assistive technologies (`role="none"`). */
    readonly decorative = input(false, { transform: booleanAttribute });
    readonly state = computed<SeparatorState>(() => ({
        orientation: this.orientation(),
        decorative: this.decorative(),
    }));
    protected readonly data = computed(() =>
        dataValues({ orientation: this.state().orientation }),
    );
}
