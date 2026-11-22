import { Directive, forwardRef } from "@angular/core";
import { MenuRadioGroup } from "@fragiola/primitives-angular/menu";

/**
 * A `group` of RadioItems holding their value, Menu's RadioGroup: `<div contextMenuRadioGroup
 * [(value)]="sort">`.
 */
@Directive({
    selector: "[contextMenuRadioGroup]",
    exportAs: "contextMenuRadioGroup",
    providers: [
        {
            provide: MenuRadioGroup,
            useExisting: forwardRef(() => ContextMenuRadioGroup),
        },
    ],
})
export class ContextMenuRadioGroup extends MenuRadioGroup {}
