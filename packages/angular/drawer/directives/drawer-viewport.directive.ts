import { Directive, inject } from "@angular/core";
import { DialogViewport } from "@fragiola/primitives-angular/dialog";
import { DrawerRoot } from "./drawer-root.directive.ts";

/** The container the popup sits in, Dialog's Viewport with the swipe's `data-swiping`: `<div drawerViewport>`. */
@Directive({
    selector: "[drawerViewport]",
    exportAs: "drawerViewport",
    host: {
        "[attr.data-swiping]": "drawer.swipe().swiping ? '' : null",
    },
})
export class DrawerViewport extends DialogViewport {
    protected readonly drawer = inject<DrawerRoot<unknown>>(DrawerRoot);
}
