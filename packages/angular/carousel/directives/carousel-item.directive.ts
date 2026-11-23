import {
    computed,
    Directive,
    inject,
    input,
    numberAttribute,
} from "@angular/core";
import { CarouselRoot } from "./carousel-root.directive.ts";

/** What a slide renders with. */
export interface CarouselItemState {
    index: number;
    /** The slide is on the current page. */
    inView: boolean;
}

/**
 * One slide (spec/carousel.md): `<div carouselItem [index]="0" aria-label="1 of 4">`, a `group`
 * with the role description "slide" (a `tabpanel` in the tabbed variant), the app naming it; out
 * of view, `inert` and hidden from assistive technology.
 */
@Directive({
    selector: "[carouselItem]",
    exportAs: "carouselItem",
    host: {
        "data-primitives-part": "carousel-item",
        "[attr.id]": "root.slideId(index())",
        "[attr.role]": "tabbed() ? 'tabpanel' : 'group'",
        "[attr.aria-roledescription]": "tabbed() ? null : 'slide'",
        "[attr.aria-hidden]": "state().inView ? null : 'true'",
        "[attr.inert]": "state().inView ? null : ''",
        "[style.scroll-snap-align]": "snaps() ? 'start' : null",
        "[attr.data-index]": "index()",
        "[attr.data-inview]": "state().inView ? '' : null",
    },
})
export class CarouselItem {
    /** Its slide, from 0. */
    readonly index = input.required({ transform: numberAttribute });
    protected readonly root = inject(CarouselRoot);
    protected readonly tabbed = computed(
        () => this.root.variant() === "tabbed",
    );
    protected readonly snaps = computed(() =>
        this.root.pages().includes(this.index()),
    );
    readonly state = computed<CarouselItemState>(() => ({
        index: this.index(),
        inView: this.root.inView().has(this.index()),
    }));
}
