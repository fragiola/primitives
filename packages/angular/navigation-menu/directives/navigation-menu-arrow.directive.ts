import { computed, Directive, inject } from "@angular/core";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { NavigationMenuRoot } from "./navigation-menu-root.directive.ts";

/** Points at the open item's Trigger: `<div navigationMenuArrow>`. */
@Directive({
    selector: "[navigationMenuArrow]",
    exportAs: "navigationMenuArrow",
    host: {
        "aria-hidden": "true",
        "data-primitives-part": "navigation-menu-arrow",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
    },
})
export class NavigationMenuArrow {
    private readonly root = inject(NavigationMenuRoot);
    readonly state = this.root.placed.asReadonly();
    protected readonly data = computed(() => {
        const open = this.root.open();
        return dataValues({ ...this.state(), open, closed: !open });
    });

    constructor() {
        registerHost(this.root.arrow);
    }
}
