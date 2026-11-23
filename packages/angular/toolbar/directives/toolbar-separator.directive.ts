import { computed, Directive, inject } from "@angular/core";
import { dataValues } from "@fragiola/primitives-angular/internal";
import { ToolbarRoot } from "./toolbar-root.directive.ts";

export interface ToolbarSeparatorState {
    /** Across the toolbar's: `"vertical"` in a horizontal toolbar. */
    orientation: "horizontal" | "vertical";
}

/** A separator across a toolbar's orientation (spec/toolbar.md): `<div toolbarSeparator>`, not focusable. */
@Directive({
    selector: "[toolbarSeparator]",
    exportAs: "toolbarSeparator",
    host: {
        role: "separator",
        "data-primitives-part": "toolbar-separator",
        "[attr.aria-orientation]": "state().orientation",
        "[attr.data-orientation]": "data().orientation",
    },
})
export class ToolbarSeparator {
    private readonly root = inject(ToolbarRoot);
    readonly state = computed<ToolbarSeparatorState>(() => ({
        orientation:
            this.root.orientation() === "horizontal"
                ? "vertical"
                : "horizontal",
    }));
    protected readonly data = computed(() => dataValues(this.state()));
}
