import { Directive } from "@angular/core";
import { DialogDescription } from "@fragiola/primitives-angular/dialog";

/** Describes the drawer, Dialog's Description: `<p drawerDescription>`. */
@Directive({
    selector: "[drawerDescription]",
    exportAs: "drawerDescription",
})
export class DrawerDescription extends DialogDescription {}
