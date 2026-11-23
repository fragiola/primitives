import {
    computed,
    Directive,
    inject,
    input,
    numberAttribute,
} from "@angular/core";
import { CarouselRoot } from "./carousel-root.directive.ts";

/** What an Indicator renders with. */
export interface CarouselIndicatorState {
    /** Its page. */
    index: number;
    /** It is the current page's. */
    current: boolean;
}

/**
 * Picks a page (spec/carousel.md): `<button carouselIndicator [index]="0" aria-label="Slide 1">`,
 * `aria-disabled` while it is the current page's (the APG's grouped style); in the tabbed variant
 * a tab of the roving tab stop.
 */
@Directive({
    selector: "button[carouselIndicator]",
    exportAs: "carouselIndicator",
    host: {
        type: "button",
        "data-primitives-part": "carousel-indicator",
        "[attr.id]": "root.indicatorId(index())",
        "[attr.role]": "tabbed() ? 'tab' : null",
        "[attr.aria-selected]":
            "tabbed() ? (state().current ? 'true' : 'false') : null",
        "[attr.aria-controls]": "tabbed() ? root.slideId(index()) : null",
        "[attr.tabindex]": "tabbed() ? (state().current ? 0 : -1) : null",
        "[attr.aria-disabled]": "!tabbed() && state().current ? 'true' : null",
        "[attr.data-current]": "state().current ? '' : null",
        "(click)": "press($event)",
    },
})
export class CarouselIndicator {
    /** The page it picks, from 0. */
    readonly index = input.required({ transform: numberAttribute });
    protected readonly root = inject(CarouselRoot);
    protected readonly tabbed = computed(
        () => this.root.variant() === "tabbed",
    );
    readonly state = computed<CarouselIndicatorState>(() => ({
        index: this.index(),
        current: this.index() === this.root.currentPage(),
    }));

    protected press(event: Event): void {
        if (this.state().current) {
            return;
        }
        this.root.setPage(this.index(), { reason: "item-press", event });
    }
}
