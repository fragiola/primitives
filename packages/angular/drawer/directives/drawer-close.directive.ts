import { Directive } from "@angular/core";
import { DialogClose } from "@fragiola/primitives-angular/dialog";

/** Closes the drawer (reason `close-press`), Dialog's Close: `<button drawerClose>`. */
@Directive({
    selector: "[drawerClose]",
    exportAs: "drawerClose",
})
export class DrawerClose extends DialogClose {}
