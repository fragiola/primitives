import { computed, Directive, inject } from "@angular/core";
import { dataValues } from "@fragiola/primitives-angular/internal";
import { NavigationMenuRoot } from "./navigation-menu-root.directive.ts";

/** Covers the page while a Content is open; decorative: `<div navigationMenuBackdrop>`. */
@Directive({
    selector: "[navigationMenuBackdrop]",
    exportAs: "navigationMenuBackdrop",
    host: {
        "aria-hidden": "true",
        "data-primitives-part": "navigation-menu-backdrop",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-starting-style]": "data()['starting-style']",
        "[attr.data-ending-style]": "data()['ending-style']",
    },
})
export class NavigationMenuBackdrop {
    private readonly root = inject(NavigationMenuRoot);
    readonly state = computed(() => ({ open: this.root.open() }));
    protected readonly data = computed(() => {
        const open = this.root.open();
        const status = this.root.presence.status();
        return dataValues({
            open,
            closed: !open,
            "starting-style": status === "starting",
            "ending-style": status === "ending",
        });
    });
}
