import { computed, Directive, inject } from "@angular/core";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { HoverCardRoot } from "./hover-card-root.directive.ts";

/** Points at the anchor; placed along the popup's edge by the positioner: `<div hoverCardArrow>`. */
@Directive({
    selector: "[hoverCardArrow]",
    exportAs: "hoverCardArrow",
    host: {
        "aria-hidden": "true",
        "data-primitives-part": "hover-card-arrow",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
    },
})
export class HoverCardArrow {
    private readonly root = inject<HoverCardRoot>(HoverCardRoot);
    readonly state = this.root.placed.asReadonly();
    protected readonly data = computed(() => {
        const open = this.root.overlay.open();
        return dataValues({ ...this.state(), open, closed: !open });
    });

    constructor() {
        registerHost(this.root.arrow);
    }
}
