import { computed, Directive, inject } from "@angular/core";
import type { ScrollAreaOrientation } from "@fragiola/primitives/scroll-area";
import { injectHost } from "@fragiola/primitives-angular/internal";
import { ScrollAreaRoot } from "./scroll-area-root.directive.ts";
import { ScrollAreaScrollbar } from "./scroll-area-scrollbar.directive.ts";

export interface ScrollAreaThumbState {
    /** The user scrolls its axis. */
    scrolling: boolean;
    orientation: ScrollAreaOrientation;
}

/**
 * The thumb of a Scrollbar (spec/scroll-area.md): `<div scrollAreaThumb>` inside the element of
 * `*scrollAreaScrollbar`. Its size is the Scrollbar's `--scroll-area-thumb-*` variable, and the
 * toolkit places it along the track.
 */
@Directive({
    selector: "[scrollAreaThumb]",
    exportAs: "scrollAreaThumb",
    host: {
        "data-primitives-part": "scroll-area-thumb",
        "[attr.data-orientation]": "state().orientation",
        "[attr.data-scrolling]": "state().scrolling ? '' : null",
        "[style.height]": "vertical ? 'var(--scroll-area-thumb-height)' : null",
        "[style.width]": "vertical ? null : 'var(--scroll-area-thumb-width)'",
    },
})
export class ScrollAreaThumb {
    private readonly root = inject(ScrollAreaRoot);
    private readonly scrollbar = inject(ScrollAreaScrollbar);
    // a Thumb keeps the axis it was rendered for (its Scrollbar's element is rendered again for
    // another one)
    protected readonly vertical = this.scrollbar.orientation() === "vertical";
    readonly state = computed<ScrollAreaThumbState>(() => {
        const measured = this.root.measured();
        return {
            scrolling: this.vertical
                ? measured.scrollingY
                : measured.scrollingX,
            orientation: this.vertical ? "vertical" : "horizontal",
        };
    });

    constructor() {
        this.root.registerHost(
            this.vertical ? "thumb-y" : "thumb-x",
            injectHost(),
        );
    }
}
