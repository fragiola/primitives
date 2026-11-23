import { Directive } from "@angular/core";
import { stepsStepTrigger } from "../utils/steps-step-trigger.ts";

/** The step before (spec/steps.md): disabled on the first step. `<button stepsPrevTrigger>`. */
@Directive({
    selector: "button[stepsPrevTrigger]",
    exportAs: "stepsPrevTrigger",
    host: {
        type: "button",
        "data-primitives-part": "steps-prev-trigger",
        "[attr.disabled]": "control.state().disabled ? '' : null",
        "[attr.data-disabled]": "control.state().disabled ? '' : null",
        "(click)": "control.press($event)",
    },
})
export class StepsPrevTrigger {
    protected readonly control = stepsStepTrigger("prev");
    readonly state = this.control.state;
}
