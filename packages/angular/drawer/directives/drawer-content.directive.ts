import { Directive, inject } from "@angular/core";
import { DrawerRoot } from "./drawer-root.directive.ts";

/**
 * The drawer's content: a mouse press inside it selects text instead of swiping (spec/drawer.md,
 * "Swipe"); a touch still swipes. `<div drawerContent>`.
 */
@Directive({
    selector: "[drawerContent]",
    exportAs: "drawerContent",
    host: { "data-primitives-part": "drawer-content" },
})
export class DrawerContent {
    protected readonly root = inject(DrawerRoot);
}
