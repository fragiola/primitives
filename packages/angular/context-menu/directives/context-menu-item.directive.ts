import { Directive } from "@angular/core";
import { MenuItem } from "@fragiola/primitives-angular/menu";

/**
 * An action, Menu's Item: `<div contextMenuItem (click)="...">`.
 */
@Directive({
    selector: "[contextMenuItem]",
    exportAs: "contextMenuItem",
})
export class ContextMenuItem extends MenuItem {}
