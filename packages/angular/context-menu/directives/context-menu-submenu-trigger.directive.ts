import { Directive } from "@angular/core";
import { MenuSubmenuTrigger } from "@fragiola/primitives-angular/menu";

/**
 * An item that opens its submenu, Menu's SubmenuTrigger, inside the `[contextMenuSubmenuRoot]`:
 * `<div contextMenuSubmenuTrigger>`.
 */
@Directive({
    selector: "[contextMenuSubmenuTrigger]",
    exportAs: "contextMenuSubmenuTrigger",
})
export class ContextMenuSubmenuTrigger extends MenuSubmenuTrigger {}
