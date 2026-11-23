import { Directive } from "@angular/core";
import { carouselStepTrigger } from "../utils/carousel-step-trigger.ts";

/** The page before (spec/carousel.md): disabled on the first page unless `loop`: `<button carouselPrevTrigger>`. */
@Directive({
    selector: "button[carouselPrevTrigger]",
    exportAs: "carouselPrevTrigger",
    host: {
        type: "button",
        "data-primitives-part": "carousel-prev-trigger",
        "[attr.aria-controls]": "control.root.groupId()",
        "[attr.disabled]": "control.state().disabled ? '' : null",
        "[attr.data-disabled]": "control.state().disabled ? '' : null",
        "(click)": "control.press($event)",
    },
})
export class CarouselPrevTrigger {
    protected readonly control = carouselStepTrigger("prev");
    readonly state = this.control.state;
}
