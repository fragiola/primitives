import { Directive, inject } from "@angular/core";
import { StepsItem } from "./steps-item.directive.ts";

/** Its step's number or check mark (spec/steps.md): `<span stepsIndicator>`, hidden from assistive technology. */
@Directive({
    selector: "[stepsIndicator]",
    exportAs: "stepsIndicator",
    host: {
        "aria-hidden": "true",
        "data-primitives-part": "steps-indicator",
        "[attr.data-current]": "item.data().current",
        "[attr.data-completed]": "item.data().completed",
        "[attr.data-incomplete]": "item.data().incomplete",
    },
})
export class StepsIndicator {
    protected readonly item = inject(StepsItem);
    readonly state = this.item.state;
}
