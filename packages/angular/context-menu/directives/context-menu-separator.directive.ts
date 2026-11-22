import { Directive } from "@angular/core";
import { MenuSeparator } from "@fragiola/primitives-angular/menu";

/**
 * Separates items, Menu's Separator: `<div contextMenuSeparator>`.
 */
@Directive({
    selector: "[contextMenuSeparator]",
    exportAs: "contextMenuSeparator",
})
export class ContextMenuSeparator extends MenuSeparator {}
