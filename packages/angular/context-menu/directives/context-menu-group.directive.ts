import { Directive, forwardRef } from "@angular/core";
import { MenuGroup } from "@fragiola/primitives-angular/menu";

/**
 * Groups items under its GroupLabel, Menu's Group: `<div contextMenuGroup>`.
 */
@Directive({
    selector: "[contextMenuGroup]",
    exportAs: "contextMenuGroup",
    providers: [
        { provide: MenuGroup, useExisting: forwardRef(() => ContextMenuGroup) },
    ],
})
export class ContextMenuGroup extends MenuGroup {}
