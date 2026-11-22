import { Directive } from "@angular/core";
import { MenuPositioner } from "@fragiola/primitives-angular/menu";

/**
 * Places the context menu at the pointer (or at the focused element, from the keyboard), Menu's
 * Positioner; a submenu at the end side of its submenu trigger. `<div contextMenuPositioner>`.
 */
@Directive({
    selector: "[contextMenuPositioner]",
    exportAs: "contextMenuPositioner",
})
export class ContextMenuPositioner extends MenuPositioner {}
