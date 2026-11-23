import { computed, inject, type Signal } from "@angular/core";
import { stepCarouselPage } from "@fragiola/primitives/carousel";
import { CarouselRoot } from "../directives/carousel-root.directive.ts";

/** What a PrevTrigger or a NextTrigger renders with. */
export interface CarouselStepTriggerState {
    /** The page it moves to, `null` at an edge. */
    page: number | null;
    disabled: boolean;
}

/**
 * The shared code of the PrevTrigger and the NextTrigger (spec/carousel.md), in the directive's
 * injection context: its target page, disabled at its edge unless `loop`, and its press.
 */
export function carouselStepTrigger(kind: "prev" | "next"): {
    root: CarouselRoot;
    state: Signal<CarouselStepTriggerState>;
    press: (event: Event) => void;
} {
    const root = inject(CarouselRoot);
    const state = computed<CarouselStepTriggerState>(() => {
        const page = stepCarouselPage(
            root.currentPage(),
            root.pages().length,
            kind === "prev" ? -1 : 1,
            root.loop(),
        );
        return { page, disabled: page === null };
    });
    return {
        root,
        state,
        press: (event) => {
            const { page } = state();
            if (page === null) {
                return;
            }
            root.setPage(page, {
                reason: kind === "prev" ? "previous-press" : "next-press",
                event,
            });
        },
    };
}
