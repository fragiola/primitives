import { Directive } from "@angular/core";
import { MenuGroupLabel } from "@fragiola/primitives-angular/menu";

/**
 * Names its Group, Menu's GroupLabel: `<div contextMenuGroupLabel>`.
 */
@Directive({
    selector: "[contextMenuGroupLabel]",
    exportAs: "contextMenuGroupLabel",
})
export class ContextMenuGroupLabel extends MenuGroupLabel {}
