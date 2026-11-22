import { Directive, inject } from "@angular/core";
import { DialogBackdrop } from "@fragiola/primitives-angular/dialog";
import { DrawerRoot } from "./drawer-root.directive.ts";

/**
 * The layer behind the popup, Dialog's Backdrop with the swipe's `data-swiping` and
 * `--drawer-swipe-progress`: `<div drawerBackdrop>` (a nested one renders nothing unless
 * `forceRender`).
 */
@Directive({
    selector: "[drawerBackdrop]",
    exportAs: "drawerBackdrop",
    host: {
        "[style.--drawer-swipe-progress]": "drawer.swipe().progress",
        "[attr.data-swiping]": "drawer.swipe().swiping ? '' : null",
    },
})
export class DrawerBackdrop extends DialogBackdrop {
    protected readonly drawer = inject<DrawerRoot<unknown>>(DrawerRoot);
}
