import { Directive } from "@angular/core";
import { stepsStepTrigger } from "../utils/steps-step-trigger.ts";

/** The step after, past the last the completed state (spec/steps.md): disabled once completed, and in a linear process while the current step is not valid. `<button stepsNextTrigger>`. */
@Directive({
    selector: "button[stepsNextTrigger]",
    exportAs: "stepsNextTrigger",
    host: {
        type: "button",
        "data-primitives-part": "steps-next-trigger",
        "[attr.disabled]": "control.state().disabled ? '' : null",
        "[attr.data-disabled]": "control.state().disabled ? '' : null",
        "(click)": "control.press($event)",
    },
})
export class StepsNextTrigger {
    protected readonly control = stepsStepTrigger("next");
    readonly state = this.control.state;
}
