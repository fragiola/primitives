import { Directive, inject } from "@angular/core";
import { StepsItem } from "./steps-item.directive.ts";

/** The line from its step to the next (spec/steps.md): `<div stepsSeparator>`, hidden from assistive technology. */
@Directive({
    selector: "[stepsSeparator]",
    exportAs: "stepsSeparator",
    host: {
        "aria-hidden": "true",
        "data-primitives-part": "steps-separator",
        "[attr.data-current]": "item.data().current",
        "[attr.data-completed]": "item.data().completed",
        "[attr.data-incomplete]": "item.data().incomplete",
        "[attr.data-orientation]": "item.data().orientation",
    },
})
export class StepsSeparator {
    protected readonly item = inject(StepsItem);
    readonly state = this.item.state;
}
