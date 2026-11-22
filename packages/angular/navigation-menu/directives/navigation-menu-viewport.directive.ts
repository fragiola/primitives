import { Directive, inject } from "@angular/core";
import { registerHost } from "@fragiola/primitives-angular/internal";
import { NavigationMenuRoot } from "./navigation-menu-root.directive.ts";

/** Where the open Content renders, inside the Popup: `<div navigationMenuViewport>`. */
@Directive({
    selector: "[navigationMenuViewport]",
    exportAs: "navigationMenuViewport",
    host: { "data-primitives-part": "navigation-menu-viewport" },
})
export class NavigationMenuViewport {
    constructor() {
        registerHost(inject(NavigationMenuRoot).viewport);
    }
}
