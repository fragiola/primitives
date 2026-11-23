import { computed, Directive, inject } from "@angular/core";
import { injectHost } from "@fragiola/primitives-angular/internal";
import {
    ScrollAreaRoot,
    scrollAreaData,
} from "./scroll-area-root.directive.ts";

/**
 * The element that scrolls, natively (spec/scroll-area.md): `<div scrollAreaViewport>`. Its
 * native scrollbars are hidden, and it takes a tab stop while it overflows with nothing focusable
 * in it.
 */
@Directive({
    selector: "[scrollAreaViewport]",
    exportAs: "scrollAreaViewport",
    host: {
        "data-primitives-part": "scroll-area-viewport",
        "[attr.tabindex]": "root.measured().focusable ? '0' : null",
        "[style.overflow]": "'scroll'",
        "[style.scrollbar-width]": "'none'",
        "[attr.data-scrolling]": "data().scrolling",
        "[attr.data-has-overflow-x]": "data()['has-overflow-x']",
        "[attr.data-has-overflow-y]": "data()['has-overflow-y']",
        "[attr.data-overflow-x-start]": "data()['overflow-x-start']",
        "[attr.data-overflow-x-end]": "data()['overflow-x-end']",
        "[attr.data-overflow-y-start]": "data()['overflow-y-start']",
        "[attr.data-overflow-y-end]": "data()['overflow-y-end']",
    },
})
export class ScrollAreaViewport {
    protected readonly root = inject(ScrollAreaRoot);
    readonly state = this.root.state;
    protected readonly data = computed(() => scrollAreaData(this.state()));

    constructor() {
        this.root.registerHost("viewport", injectHost());
    }
}
