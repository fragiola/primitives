import { Directive, forwardRef } from "@angular/core";
import { MenuCheckboxItem } from "@fragiola/primitives-angular/menu";

/**
 * A `menuitemcheckbox`, Menu's CheckboxItem: `<div contextMenuCheckboxItem [(checked)]="shown">`.
 */
@Directive({
    selector: "[contextMenuCheckboxItem]",
    exportAs: "contextMenuCheckboxItem",
    providers: [
        {
            provide: MenuCheckboxItem,
            useExisting: forwardRef(() => ContextMenuCheckboxItem),
        },
    ],
})
export class ContextMenuCheckboxItem extends MenuCheckboxItem {}
