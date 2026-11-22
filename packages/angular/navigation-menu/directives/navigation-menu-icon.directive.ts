import { computed, Directive, inject } from "@angular/core";
import { dataValue } from "@fragiola/primitives-angular/internal";
import { NavigationMenuItem } from "./navigation-menu-item.directive.ts";

/** A decorative mark inside a Trigger (a chevron the recipe draws): `<span navigationMenuIcon>`. */
@Directive({
    selector: "[navigationMenuIcon]",
    exportAs: "navigationMenuIcon",
    host: {
        "aria-hidden": "true",
        "data-primitives-part": "navigation-menu-icon",
        "[attr.data-popup-open]": "popupOpen()",
    },
})
export class NavigationMenuIcon {
    private readonly item = inject(NavigationMenuItem);
    readonly state = computed(() => ({ open: this.item.open() }));
    protected readonly popupOpen = computed(() => dataValue(this.item.open()));
}
