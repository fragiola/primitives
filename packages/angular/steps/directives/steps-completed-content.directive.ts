import { Directive, inject } from "@angular/core";
import { StepsRoot } from "./steps-root.directive.ts";

/** What shows once every step is done (spec/steps.md): `<div stepsCompletedContent>`, `hidden` until then. */
@Directive({
    selector: "[stepsCompletedContent]",
    exportAs: "stepsCompletedContent",
    host: {
        "data-primitives-part": "steps-completed-content",
        "[attr.hidden]": "root.state().completed ? null : ''",
    },
})
export class StepsCompletedContent {
    protected readonly root = inject(StepsRoot);
    readonly state = this.root.state;
}
