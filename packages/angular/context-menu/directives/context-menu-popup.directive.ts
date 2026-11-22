import { Directive } from "@angular/core";
import { MenuPopup } from "@fragiola/primitives-angular/menu";

/**
 * One level of the context menu, Menu's Popup: roving focus, typeahead, Escape per level. Name
 * the root level with `aria-label`: no button names it. `<div contextMenuPopup aria-label="File
 * actions">`.
 */
@Directive({
    selector: "[contextMenuPopup]",
    exportAs: "contextMenuPopup",
})
export class ContextMenuPopup extends MenuPopup {}
