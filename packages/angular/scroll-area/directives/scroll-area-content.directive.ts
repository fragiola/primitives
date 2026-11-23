import { computed, Directive, inject } from "@angular/core";
import { injectHost } from "@fragiola/primitives-angular/internal";
import {
    ScrollAreaRoot,
    scrollAreaData,
} from "./scroll-area-root.directive.ts";

/** The scrolled content, measured when it resizes (spec/scroll-area.md): `<div scrollAreaContent>`. */
@Directive({
    selector: "[scrollAreaContent]",
    exportAs: "scrollAreaContent",
    host: {
        role: "presentation",
        "data-primitives-part": "scroll-area-content",
        "[style.min-width]": "'fit-content'",
        "[attr.data-scrolling]": "data().scrolling",
        "[attr.data-has-overflow-x]": "data()['has-overflow-x']",
        "[attr.data-has-overflow-y]": "data()['has-overflow-y']",
        "[attr.data-overflow-x-start]": "data()['overflow-x-start']",
        "[attr.data-overflow-x-end]": "data()['overflow-x-end']",
        "[attr.data-overflow-y-start]": "data()['overflow-y-start']",
        "[attr.data-overflow-y-end]": "data()['overflow-y-end']",
    },
})
export class ScrollAreaContent {
    private readonly root = inject(ScrollAreaRoot);
    readonly state = this.root.state;
    protected readonly data = computed(() => scrollAreaData(this.state()));

    constructor() {
        this.root.registerHost("content", injectHost());
    }
}
