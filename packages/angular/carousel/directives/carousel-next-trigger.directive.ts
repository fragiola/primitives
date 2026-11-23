import { Directive } from "@angular/core";
import { carouselStepTrigger } from "../utils/carousel-step-trigger.ts";

/** The page after (spec/carousel.md): disabled on the last page unless `loop`: `<button carouselNextTrigger>`. */
@Directive({
    selector: "button[carouselNextTrigger]",
    exportAs: "carouselNextTrigger",
    host: {
        type: "button",
        "data-primitives-part": "carousel-next-trigger",
        "[attr.aria-controls]": "control.root.groupId()",
        "[attr.disabled]": "control.state().disabled ? '' : null",
        "[attr.data-disabled]": "control.state().disabled ? '' : null",
        "(click)": "control.press($event)",
    },
})
export class CarouselNextTrigger {
    protected readonly control = carouselStepTrigger("next");
    readonly state = this.control.state;
}
