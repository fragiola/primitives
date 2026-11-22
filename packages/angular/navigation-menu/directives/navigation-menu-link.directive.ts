import { booleanAttribute, computed, Directive, input } from "@angular/core";
import { dataValue } from "@fragiola/primitives-angular/internal";

/**
 * A link, in the List or in a Content (spec/navigation-menu.md): `<a navigationMenuLink href="#"
 * [active]="true">`.
 */
@Directive({
    selector: "[navigationMenuLink]",
    exportAs: "navigationMenuLink",
    host: {
        "data-primitives-part": "navigation-menu-link",
        "[attr.aria-current]": "active() ? 'page' : null",
        "[attr.data-active]": "dataActive()",
    },
})
export class NavigationMenuLink {
    /** The link of the current page (`aria-current="page"`). */
    readonly active = input(false, { transform: booleanAttribute });
    readonly state = computed(() => ({ active: this.active() }));
    protected readonly dataActive = computed(() => dataValue(this.active()));
}
