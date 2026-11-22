import { Directive, forwardRef } from "@angular/core";
import { MenuRadioItem } from "@fragiola/primitives-angular/menu";

/**
 * A `menuitemradio`, Menu's RadioItem: `<div contextMenuRadioItem value="name">`.
 */
@Directive({
    selector: "[contextMenuRadioItem]",
    exportAs: "contextMenuRadioItem",
    providers: [
        {
            provide: MenuRadioItem,
            useExisting: forwardRef(() => ContextMenuRadioItem),
        },
    ],
})
export class ContextMenuRadioItem extends MenuRadioItem {}
