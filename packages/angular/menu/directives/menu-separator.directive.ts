import { Directive, inject } from "@angular/core";
import { MenuRootBase } from "./menu-root-base.ts";

/** Separates items: `<div menuSeparator>`. */
@Directive({
    selector: "[menuSeparator]",
    host: {
        role: "separator",
        "aria-orientation": "horizontal",
        "[attr.data-primitives-part]": "part",
    },
})
export class MenuSeparator {
    protected readonly part =
        inject(MenuRootBase, { optional: true })?.part("separator") ??
        "menu-separator";
}
