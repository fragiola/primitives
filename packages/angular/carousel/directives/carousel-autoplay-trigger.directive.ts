import { computed, Directive, inject } from "@angular/core";
import { CarouselRoot } from "./carousel-root.directive.ts";

/** What the AutoplayTrigger renders with. */
export interface CarouselAutoplayTriggerState {
    playing: boolean;
}

/**
 * Stops and starts the rotation (spec/carousel.md): `<button carouselAutoplayTrigger
 * #rotation="carouselAutoplayTrigger">`, the APG's rotation control, whose label (the app's,
 * from `rotation.state().playing`) changes with the state, with no `aria-pressed`.
 */
@Directive({
    selector: "button[carouselAutoplayTrigger]",
    exportAs: "carouselAutoplayTrigger",
    host: {
        type: "button",
        "data-primitives-part": "carousel-autoplay-trigger",
        "[attr.data-playing]": "state().playing ? '' : null",
        "(click)": "press($event)",
    },
})
export class CarouselAutoplayTrigger {
    protected readonly root = inject(CarouselRoot);
    readonly state = computed<CarouselAutoplayTriggerState>(() => ({
        playing: this.root.isPlaying(),
    }));

    protected press(event: Event): void {
        this.root.setPlaying(!this.root.isPlaying(), {
            reason: "trigger-press",
            event,
        });
    }
}
