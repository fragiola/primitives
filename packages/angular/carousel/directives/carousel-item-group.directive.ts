import { computed, Directive, inject } from "@angular/core";
import { registerHost } from "@fragiola/primitives-angular/internal";
import { CarouselRoot } from "./carousel-root.directive.ts";

/** A slide's share of the group, less the spacing (spec/carousel.md, "State attributes"). */
const SLIDE_SIZE =
    "calc((100% - var(--carousel-spacing) * (var(--carousel-slides-per-page) - 1)) / var(--carousel-slides-per-page))";

/**
 * The slides' scroll container and live region (spec/carousel.md): `<div carouselItemGroup>`,
 * `aria-live="off"` while the slides rotate, `"polite"` otherwise; its structural style lays the
 * slides out on its axis and scrolls them with mandatory snapping.
 */
@Directive({
    selector: "[carouselItemGroup]",
    exportAs: "carouselItemGroup",
    host: {
        "data-primitives-part": "carousel-item-group",
        "aria-atomic": "false",
        "[attr.id]": "root.groupId()",
        "[attr.aria-live]": "root.isPlaying() ? 'off' : 'polite'",
        "[attr.tabindex]": "root.groupTabStop() ? 0 : null",
        "[style.display]": "'grid'",
        "[style.grid-auto-flow]": "vertical() ? 'row' : 'column'",
        "[style.grid-auto-columns]": "vertical() ? null : size",
        "[style.grid-auto-rows]": "vertical() ? size : null",
        "[style.gap]": "'var(--carousel-spacing)'",
        "[style.overflow-x]": "vertical() ? null : 'auto'",
        "[style.overflow-y]": "vertical() ? 'auto' : null",
        "[style.overscroll-behavior-x]": "vertical() ? null : 'contain'",
        "[style.overscroll-behavior-y]": "vertical() ? 'contain' : null",
        "[style.scroll-snap-type]":
            "vertical() ? 'y mandatory' : 'x mandatory'",
        "[style.scrollbar-width]": "'none'",
        "[attr.data-orientation]": "root.orientation()",
        "[attr.data-dragging]": "root.state().dragging ? '' : null",
    },
})
export class CarouselItemGroup {
    protected readonly root = inject(CarouselRoot);
    protected readonly size = SLIDE_SIZE;
    protected readonly vertical = computed(
        () => this.root.orientation() === "vertical",
    );
    readonly state = this.root.state;

    constructor() {
        registerHost(this.root.group);
    }
}
