import { Directive } from "@angular/core";
import { DialogTitle } from "@fragiola/primitives-angular/dialog";

/** Names the drawer, Dialog's Title: `<h2 drawerTitle>`. */
@Directive({
    selector: "[drawerTitle]",
    exportAs: "drawerTitle",
})
export class DrawerTitle extends DialogTitle {}
